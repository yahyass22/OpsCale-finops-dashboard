from __future__ import annotations

import sys
from html import escape
from pathlib import Path

import pandas as pd
import plotly.graph_objects as go
import streamlit as st

sys.path.insert(0, str(Path(__file__).parent / "src"))

from tco import CloudCostAssumptions, LocalCostAssumptions, calculate_tco, recommend_placement
from tco.export import executive_summary_text, projection_to_csv
from tco.presets import PRESETS


LIGHT_SURFACE = "#ffffff"
CHART_GRID = "#edf1f4"
CHART_FONT = "#172026"


st.set_page_config(
    page_title="TCO Repatriation Dashboard",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded",
)


CSS = """
<style>
    :root,
    .stApp {
        --surface: #ffffff;
        --soft: #f7f9fb;
        --ink: #172026;
        --muted: #5e6a71;
        --line: #d9e1e6;
        --chart-grid: #edf1f4;
        --green: #159a74;
        --blue: #1d5fd1;
        --amber: #c88116;
        --red: #c44949;
        --summary-bg: #fbfcfd;
        --formula-bg: #f6f8fa;
    }
    .stApp {
        background: var(--surface);
        color: var(--ink);
    }
    .main .block-container {
        padding-top: 1.2rem;
        max-width: 1380px;
    }
    h1, h2, h3 {
        letter-spacing: 0;
    }
    div[data-testid="stMetric"] {
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 1rem 1.05rem;
        min-height: 112px;
    }
    div[data-testid="stMetricValue"] {
        color: var(--ink);
        font-size: 1.65rem;
        line-height: 1.15;
        white-space: normal;
    }
    div[data-testid="stMetricLabel"] {
        color: var(--muted);
    }
    section[data-testid="stSidebar"] {
        background: var(--soft);
    }
    .recommendation-card {
        border: 1px solid var(--line);
        border-left-width: 4px;
        border-radius: 8px;
        padding: 1rem 1.1rem;
        margin: .8rem 0 1rem;
        background: var(--surface);
    }
    .recommendation-context {
        border: 1px solid var(--line);
        border-radius: 8px;
        background: var(--soft);
        color: var(--ink);
        padding: .85rem 1rem;
        margin: .4rem 0 1rem;
        font-size: .92rem;
        line-height: 1.45;
    }
    .recommendation-local {
        border-left-color: var(--green);
    }
    .recommendation-hybrid {
        border-left-color: var(--amber);
    }
    .recommendation-cloud {
        border-left-color: var(--blue);
    }
    .recommendation-neutral {
        border-left-color: var(--line);
    }
    .recommendation-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
    }
    .recommendation-label {
        color: var(--ink);
        font-size: 1.08rem;
        font-weight: 700;
    }
    .recommendation-headline {
        color: var(--muted);
        margin-top: .25rem;
        font-size: .92rem;
        line-height: 1.45;
    }
    .recommendation-pill {
        border: 1px solid var(--line);
        border-radius: 999px;
        color: var(--ink);
        background: var(--soft);
        padding: .28rem .65rem;
        font-size: .78rem;
        font-weight: 650;
        white-space: nowrap;
    }
    .recommendation-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 1rem;
        margin-top: .9rem;
    }
    .recommendation-section-title {
        color: var(--muted);
        font-size: .72rem;
        font-weight: 750;
        letter-spacing: .05em;
        text-transform: uppercase;
        margin-bottom: .35rem;
    }
    .recommendation-list {
        list-style: none;
        margin: 0;
        padding: 0;
    }
    .recommendation-list li {
        border-top: 1px solid var(--line);
        color: var(--ink);
        font-size: .88rem;
        line-height: 1.4;
        padding: .42rem 0;
    }
    @media (max-width: 760px) {
        .recommendation-grid {
            grid-template-columns: 1fr;
        }
    }
    .summary-box {
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 1rem 1.1rem;
        background: var(--summary-bg);
        color: var(--ink);
    }
    .formula {
        background: var(--formula-bg);
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: .8rem .95rem;
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-size: .9rem;
        overflow-x: auto;
    }
    .small-muted {
        color: var(--muted);
        font-size: .88rem;
    }
</style>
"""


def money(value: float) -> str:
    return f"${value:,.0f}"


def signed_money(value: float) -> str:
    sign = "+" if value >= 0 else "-"
    return f"{sign}${abs(value):,.0f}"


def pct(value: float) -> str:
    return f"{value:,.1f}%"


def render_recommendation_card(recommendation) -> None:
    rationale_items = "".join(f"<li>{escape(item)}</li>" for item in recommendation.rationale)
    placement_items = "".join(f"<li>{escape(item)}</li>" for item in recommendation.placement)
    st.markdown(
        f"""
<div class="recommendation-card recommendation-{escape(recommendation.style)}">
    <div class="recommendation-top">
        <div>
            <div class="recommendation-label">{escape(recommendation.label)}</div>
            <div class="recommendation-headline">{escape(recommendation.headline)}</div>
        </div>
        <div class="recommendation-pill">Confidence: {escape(recommendation.confidence)}</div>
    </div>
    <div class="recommendation-grid">
        <div>
            <div class="recommendation-section-title">Why this result</div>
            <ul class="recommendation-list">{rationale_items}</ul>
        </div>
        <div>
            <div class="recommendation-section-title">What to do first</div>
            <ul class="recommendation-list">{placement_items}</ul>
        </div>
    </div>
</div>
        """,
        unsafe_allow_html=True,
    )


def set_preset_values(preset_name: str) -> None:
    preset = PRESETS[preset_name]
    cloud = preset.cloud
    local = preset.local
    st.session_state["scenario_name"] = preset.name

    for field in (
        "compute_monthly",
        "storage_monthly",
        "database_monthly",
        "network_monthly",
        "backup_monthly",
        "support_monthly",
        "annual_growth_rate_pct",
        "discount_pct",
    ):
        st.session_state[f"cloud_{field}"] = getattr(cloud, field)

    for field in (
        "infrastructure_subscription_monthly",
        "software_licenses_monthly",
        "support_contract_monthly",
        "power_cooling_monthly",
        "datacenter_monthly",
        "admin_labor_monthly",
        "backup_dr_monthly",
        "annual_growth_rate_pct",
        "migration_one_time",
        "installation_one_time",
    ):
        st.session_state[f"local_{field}"] = getattr(local, field)


def ensure_initial_state() -> None:
    if "scenario_name" not in st.session_state:
        set_preset_values("Steady VM estate")


def number_input(label: str, key: str, step: float = 250.0, help_text: str | None = None) -> float:
    return float(
        st.number_input(
            label,
            min_value=0.0,
            value=float(st.session_state[key]),
            step=step,
            key=key,
            help=help_text,
        )
    )


def percent_input(
    label: str,
    key: str,
    minimum: float = -100.0,
    maximum: float = 1000.0,
    help_text: str | None = None,
) -> float:
    return float(
        st.number_input(
            label,
            min_value=minimum,
            max_value=maximum,
            value=float(st.session_state[key]),
            step=1.0,
            key=key,
            help=help_text,
        )
    )


def projection_frame(result) -> pd.DataFrame:
    return pd.DataFrame(
        [
            {
                "Month": row.month,
                "Cloud monthly": row.cloud_monthly,
                "Local monthly": row.local_monthly,
                "Cloud cumulative": row.cloud_cumulative,
                "Local cumulative": row.local_cumulative,
                "Cumulative delta": row.cloud_cumulative - row.local_cumulative,
            }
            for row in result.rows
        ]
    )


def cumulative_chart(frame: pd.DataFrame, break_even_month: int | None) -> go.Figure:
    fig = go.Figure()
    fig.add_trace(
        go.Scatter(
            x=frame["Month"],
            y=frame["Cloud cumulative"],
            mode="lines",
            name="Public cloud",
            line=dict(color="#1d5fd1", width=3),
            hovertemplate="Month %{x}<br>%{y:$,.0f}<extra>Public cloud</extra>",
        )
    )
    fig.add_trace(
        go.Scatter(
            x=frame["Month"],
            y=frame["Local cumulative"],
            mode="lines",
            name="Local infrastructure",
            line=dict(color="#159a74", width=3),
            hovertemplate="Month %{x}<br>%{y:$,.0f}<extra>Local infrastructure</extra>",
        )
    )
    if break_even_month is not None:
        fig.add_vline(
            x=break_even_month,
            line_width=2,
            line_dash="dot",
            line_color="#c88116",
            annotation_text=f"Break-even: month {break_even_month}",
            annotation_position="top left",
        )
    fig.update_layout(
        title=dict(text="Cumulative TCO over time", x=0, xanchor="left", font=dict(size=16)),
        template="plotly_white",
        height=440,
        margin=dict(l=20, r=20, t=55, b=20),
        paper_bgcolor=LIGHT_SURFACE,
        plot_bgcolor=LIGHT_SURFACE,
        font=dict(color=CHART_FONT),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
        xaxis=dict(title="Month", gridcolor=CHART_GRID),
        yaxis=dict(title="Cumulative TCO", gridcolor=CHART_GRID, tickprefix="$"),
    )
    return fig


def monthly_delta_chart(frame: pd.DataFrame) -> go.Figure:
    delta = frame["Cloud monthly"] - frame["Local monthly"]
    colors = ["#159a74" if value >= 0 else "#c44949" for value in delta]
    fig = go.Figure()
    fig.add_trace(
        go.Bar(
            x=frame["Month"],
            y=delta,
            marker_color=colors,
            name="Monthly run-rate advantage",
            hovertemplate="Month %{x}<br>%{y:$,.0f}<extra>Cloud minus local</extra>",
        )
    )
    fig.add_hline(y=0, line_color="#5e6a71", line_width=1)
    fig.update_layout(
        title=dict(text="Monthly run-rate delta", x=0, xanchor="left", font=dict(size=16)),
        template="plotly_white",
        height=300,
        margin=dict(l=20, r=20, t=55, b=20),
        paper_bgcolor=LIGHT_SURFACE,
        plot_bgcolor=LIGHT_SURFACE,
        font=dict(color=CHART_FONT),
        showlegend=False,
        xaxis=dict(title="Month", gridcolor=CHART_GRID),
        yaxis=dict(title="Cloud minus local", gridcolor=CHART_GRID, tickprefix="$"),
    )
    return fig


def cumulative_delta_chart(frame: pd.DataFrame) -> go.Figure:
    colors = ["#159a74" if value >= 0 else "#c44949" for value in frame["Cumulative delta"]]
    fig = go.Figure()
    fig.add_trace(
        go.Bar(
            x=frame["Month"],
            y=frame["Cumulative delta"],
            marker_color=colors,
            name="Cumulative advantage",
            hovertemplate="Month %{x}<br>%{y:$,.0f}<extra>Cloud minus local</extra>",
        )
    )
    fig.add_hline(y=0, line_color="#5e6a71", line_width=1)
    fig.update_layout(
        title=dict(text="Cumulative cost advantage", x=0, xanchor="left", font=dict(size=16)),
        template="plotly_white",
        height=300,
        margin=dict(l=20, r=20, t=55, b=20),
        paper_bgcolor=LIGHT_SURFACE,
        plot_bgcolor=LIGHT_SURFACE,
        font=dict(color=CHART_FONT),
        showlegend=False,
        xaxis=dict(title="Month", gridcolor=CHART_GRID),
        yaxis=dict(title="Cloud minus local", gridcolor=CHART_GRID, tickprefix="$"),
    )
    return fig


def breakdown_chart(result) -> go.Figure:
    cloud = result.cloud
    local = result.local
    cloud_categories = {
        "Compute": cloud.compute_monthly,
        "Storage": cloud.storage_monthly,
        "Database": cloud.database_monthly,
        "Network": cloud.network_monthly,
        "Backup": cloud.backup_monthly,
        "Support": cloud.support_monthly,
    }
    local_categories = {
        "Infrastructure": local.infrastructure_subscription_monthly,
        "Licenses": local.software_licenses_monthly,
        "Support": local.support_contract_monthly,
        "Power/cooling": local.power_cooling_monthly,
        "Datacenter": local.datacenter_monthly,
        "Admin labor": local.admin_labor_monthly,
        "Backup/DR": local.backup_dr_monthly,
    }
    fig = go.Figure()
    fig.add_trace(
        go.Bar(
            x=list(cloud_categories.keys()),
            y=list(cloud_categories.values()),
            name="Cloud monthly base",
            marker_color="#1d5fd1",
            hovertemplate="%{x}<br>%{y:$,.0f}<extra>Cloud</extra>",
        )
    )
    fig.add_trace(
        go.Bar(
            x=list(local_categories.keys()),
            y=list(local_categories.values()),
            name="Local monthly base",
            marker_color="#159a74",
            hovertemplate="%{x}<br>%{y:$,.0f}<extra>Local</extra>",
        )
    )
    fig.update_layout(
        title=dict(text="Monthly cost composition", x=0, xanchor="left", font=dict(size=16)),
        template="plotly_white",
        height=370,
        barmode="group",
        margin=dict(l=20, r=20, t=55, b=70),
        paper_bgcolor=LIGHT_SURFACE,
        plot_bgcolor=LIGHT_SURFACE,
        font=dict(color=CHART_FONT),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
        xaxis=dict(tickangle=-25, gridcolor=CHART_GRID),
        yaxis=dict(title="Monthly cost", gridcolor=CHART_GRID, tickprefix="$"),
    )
    return fig


def main() -> None:
    st.markdown(CSS, unsafe_allow_html=True)
    ensure_initial_state()

    with st.sidebar:
        st.header("Configure")
        preset_name = st.selectbox("Preset", list(PRESETS.keys()))
        if st.button("Apply preset", use_container_width=True):
            set_preset_values(preset_name)
            st.rerun()

        scenario_name = st.text_input("Scenario name", key="scenario_name")
        months = int(st.slider("Projection window", min_value=12, max_value=60, value=36, step=12))

        st.divider()
        with st.expander("Cloud", expanded=True):
            cloud_compute = number_input("Compute", "cloud_compute_monthly", help_text="Monthly spend for VMs, containers, serverless, or equivalent compute.")
            cloud_storage = number_input("Storage", "cloud_storage_monthly", help_text="Monthly spend for object, block, file, snapshots, or archive storage.")
            cloud_database = number_input("Database", "cloud_database_monthly", help_text="Monthly spend for managed database services.")
            cloud_network = number_input("Network", "cloud_network_monthly", help_text="Monthly egress, VPN, inter-region, or connectivity cost.")
            cloud_backup = number_input("Backup", "cloud_backup_monthly", help_text="Monthly backup, snapshot, replication, or recovery service cost.")
            cloud_support = number_input("Support", "cloud_support_monthly", help_text="Monthly cloud support plan or managed service support cost.")
            cloud_growth = percent_input("Annual growth %", "cloud_annual_growth_rate_pct", help_text="Expected annual growth in cloud usage or spend.")
            cloud_discount = percent_input("Discount %", "cloud_discount_pct", 0.0, 100.0, help_text="Existing committed-use, savings plan, or negotiated cloud discount.")

        st.divider()
        with st.expander("Local", expanded=True):
            local_infra = number_input("Infrastructure subscription", "local_infrastructure_subscription_monthly", help_text="Monthly hardware, appliance, or managed local infrastructure subscription.")
            local_licenses = number_input("Software licenses", "local_software_licenses_monthly", help_text="Monthly OS, hypervisor, database, backup, or monitoring software cost.")
            local_support = number_input("Support contract", "local_support_contract_monthly", help_text="Monthly vendor support and maintenance contract cost.")
            local_power = number_input("Power and cooling", "local_power_cooling_monthly", help_text="Monthly facility cost for energy and cooling.")
            local_dc = number_input("Rack or datacenter", "local_datacenter_monthly", help_text="Monthly colocation, rack, datacenter, or cross-connect cost.")
            local_labor = number_input("Admin labor", "local_admin_labor_monthly", help_text="Monthly operations effort required to run the local environment.")
            local_backup = number_input("Backup and DR", "local_backup_dr_monthly", help_text="Monthly local backup, replication, and disaster recovery cost.")
            local_growth = percent_input("Annual local cost growth %", "local_annual_growth_rate_pct", help_text="Expected annual growth in local operating cost.")
            local_migration = number_input("One-time migration", "local_migration_one_time", step=1_000.0, help_text="One-time services, engineering, migration, and cutover cost.")
            local_install = number_input("One-time installation", "local_installation_one_time", step=1_000.0, help_text="One-time installation and implementation cost.")

    cloud = CloudCostAssumptions(
        compute_monthly=cloud_compute,
        storage_monthly=cloud_storage,
        database_monthly=cloud_database,
        network_monthly=cloud_network,
        backup_monthly=cloud_backup,
        support_monthly=cloud_support,
        annual_growth_rate_pct=cloud_growth,
        discount_pct=cloud_discount,
    )
    local = LocalCostAssumptions(
        infrastructure_subscription_monthly=local_infra,
        software_licenses_monthly=local_licenses,
        support_contract_monthly=local_support,
        power_cooling_monthly=local_power,
        datacenter_monthly=local_dc,
        admin_labor_monthly=local_labor,
        backup_dr_monthly=local_backup,
        annual_growth_rate_pct=local_growth,
        migration_one_time=local_migration,
        installation_one_time=local_install,
    )
    result = calculate_tco(cloud=cloud, local=local, months=months)
    recommendation = recommend_placement(result)
    frame = projection_frame(result)

    header_cols = st.columns([0.72, 0.28])
    with header_cols[0]:
        st.title("TCO Repatriation Dashboard")
        st.caption(f"{scenario_name} | Planning estimate based on current assumptions")
    with header_cols[1]:
        st.download_button(
            "Download CSV",
            data=projection_to_csv(result),
            file_name=f"{scenario_name.lower().replace(' ', '-')}-projection.csv",
            mime="text/csv",
            use_container_width=True,
        )

    metric_cols = st.columns(4)
    metric_cols[0].metric("Public cloud TCO", money(result.cloud_tco), delta=f"{months} months")
    metric_cols[1].metric("Local infrastructure TCO", money(result.local_tco), delta=f"{months} months")
    metric_cols[2].metric(
        "Net savings",
        signed_money(result.savings),
        delta=pct(result.savings_pct),
        delta_color="normal" if result.savings >= 0 else "inverse",
    )
    metric_cols[3].metric(
        "Break-even",
        f"Month {result.break_even_month}" if result.break_even_month else "Not reached",
        delta=money(result.monthly_run_rate_delta),
    )

    st.markdown(
        f"<div class='summary-box'>{executive_summary_text(result)}</div>",
        unsafe_allow_html=True,
    )

    tab_overview, tab_recommendation, tab_assumptions, tab_detail, tab_report = st.tabs(
        ["Overview", "Recommendation", "Assumptions", "Monthly detail", "Report notes"]
    )

    with tab_overview:
        left, right = st.columns([0.62, 0.38])
        with left:
            st.plotly_chart(cumulative_chart(frame, result.break_even_month), use_container_width=True, theme=None)
        with right:
            st.plotly_chart(monthly_delta_chart(frame), use_container_width=True, theme=None)

        lower_left, lower_right = st.columns([0.5, 0.5])
        with lower_left:
            st.plotly_chart(cumulative_delta_chart(frame), use_container_width=True, theme=None)
        with lower_right:
            st.plotly_chart(breakdown_chart(result), use_container_width=True, theme=None)

    with tab_recommendation:
        st.subheader("Hybrid strategy recommendation")
        st.markdown(
            """
<div class="recommendation-context">
This section turns the current cost comparison into a placement suggestion:
keep the workload in cloud, move predictable parts local, or use a hybrid approach.
It is based on the numbers already entered in the sidebar, not on extra hidden inputs.
</div>
            """,
            unsafe_allow_html=True,
        )
        render_recommendation_card(recommendation)

    with tab_assumptions:
        col_a, col_b = st.columns(2)
        with col_a:
            st.subheader("Public cloud base")
            st.dataframe(
                pd.DataFrame(
                    [
                        ("Compute", cloud.compute_monthly),
                        ("Storage", cloud.storage_monthly),
                        ("Database", cloud.database_monthly),
                        ("Network", cloud.network_monthly),
                        ("Backup", cloud.backup_monthly),
                        ("Support", cloud.support_monthly),
                        ("Base monthly before discount", cloud.monthly_total_before_discount),
                        ("Base monthly after discount", cloud.monthly_total_after_discount),
                    ],
                    columns=["Line item", "Amount"],
                ),
                hide_index=True,
                use_container_width=True,
                column_config={"Amount": st.column_config.NumberColumn(format="$%.0f")},
            )
        with col_b:
            st.subheader("Local infrastructure base")
            st.dataframe(
                pd.DataFrame(
                    [
                        ("Infrastructure subscription", local.infrastructure_subscription_monthly),
                        ("Software licenses", local.software_licenses_monthly),
                        ("Support contract", local.support_contract_monthly),
                        ("Power and cooling", local.power_cooling_monthly),
                        ("Rack or datacenter", local.datacenter_monthly),
                        ("Admin labor", local.admin_labor_monthly),
                        ("Backup and DR", local.backup_dr_monthly),
                        ("One-time migration", local.migration_one_time),
                        ("One-time installation", local.installation_one_time),
                    ],
                    columns=["Line item", "Amount"],
                ),
                hide_index=True,
                use_container_width=True,
                column_config={"Amount": st.column_config.NumberColumn(format="$%.0f")},
            )

        st.subheader("Formula model")
        st.markdown(
            """
<div class="formula">
cloud_month_n = cloud_monthly_after_discount * (1 + cloud_growth_pct / 100) ^ ((n - 1) / 12)<br>
local_month_n = local_monthly_total * (1 + local_growth_pct / 100) ^ ((n - 1) / 12)<br>
local_tco = migration + installation + sum(local_month_1..n)<br>
savings = cloud_tco - local_tco
</div>
            """,
            unsafe_allow_html=True,
        )

    with tab_detail:
        st.dataframe(
            frame,
            hide_index=True,
            use_container_width=True,
            column_config={
                "Cloud monthly": st.column_config.NumberColumn(format="$%.0f"),
                "Local monthly": st.column_config.NumberColumn(format="$%.0f"),
                "Cloud cumulative": st.column_config.NumberColumn(format="$%.0f"),
                "Local cumulative": st.column_config.NumberColumn(format="$%.0f"),
                "Cumulative delta": st.column_config.NumberColumn(format="$%.0f"),
            },
        )

    with tab_report:
        st.subheader("Executive summary")
        st.write(executive_summary_text(result))
        st.subheader("Placement recommendation")
        st.write(f"{recommendation.label} ({recommendation.confidence} confidence)")
        for item in recommendation.placement:
            st.markdown(f"- {item}")
        st.subheader("Decision notes")
        st.markdown(
            """
- Validate public cloud values against current billing and committed-use discounts.
- Validate local subscription pricing with vendor quotes.
- Include migration, support, backup, disaster recovery, facility, and operations labor.
- Treat this output as a planning estimate, not a procurement quote.
            """
        )


if __name__ == "__main__":
    main()
