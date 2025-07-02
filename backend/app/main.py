from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse, StreamingResponse
from backend.app.utils.loader import load_data
from backend.app.utils.preprocessing import add_basic_rates
from backend.app.data_store import data_store
from backend.app.ml import get_models
from backend.app.services.predictions import load_and_process_data
from backend.app.services.insight_service import InsightService
from backend.app.services.filter_service import FilterService
from backend.app.services.report_service import ReportService
from backend.app.services.prediction_service import PredictionService
from backend.classes.AnalysisSearchCriteria import AnalysisSearchCriteria
from backend.classes.DataRequest import DataRequest
from backend.classes.DownloadReportCriteria import DownloadReportCriteria

app = FastAPI(
    default_response_class=ORJSONResponse,
)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"])


@app.on_event("startup")
def bootstrap():
    load_and_process_data()
    df_local = add_basic_rates(load_data())
    if df_local.empty:
        raise RuntimeError("no data")
    data_store.df = df_local # type:ignore
    data_store.risk_model, data_store.anomaly_model, data_store.cluster_model = get_models(df_local) # type: ignore


def ready():
    if data_store.df is None:
        raise HTTPException(503, "loading")



@app.post("/api/alerts/prediction-insights/", response_model=InsightService.prediction_insights.__annotations__["return"])
def prediction_insights(criteria: AnalysisSearchCriteria):
    ready()
    return InsightService.prediction_insights(criteria)


@app.get("/api/alerts/filter-options", response_model=FilterService.filter_options.__annotations__["return"])
def filter_options():
    ready()
    return FilterService.filter_options()


@app.get("/api/alerts/filters/districts")
def districts():
    ready()
    return FilterService.districts()


@app.get("/api/alerts/filters/schools")
def schools(district: str | None = None):
    ready()
    return FilterService.schools(district)


@app.get("/api/alerts/filters/grades")
def grades(district: str | None = None, school: str | None = None):
    ready()
    return FilterService.grades(district, school)


@app.post("/api/alerts/download/report/{report_type}")
def download_report(report_type: str, criteria: DownloadReportCriteria):
    ready()
    pkg = ReportService.generate(report_type, criteria)
    headers = {"Content-Disposition": f"attachment; filename={pkg.filename}"}
    return StreamingResponse(
        pkg.buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers,
    )


@app.get("/api/predictions/students")
def students():
    return PredictionService.students()


@app.get("/api/predictions/all-districts")
def all_districts():
    return PredictionService.all_districts()


@app.post("/api/predictions/district")
def district_summary(req: DataRequest):
    return PredictionService.district(req)


@app.post("/api/predictions/school")
def school_summary(req: DataRequest):
    return PredictionService.school(req)


@app.post("/api/predictions/grade-details")
def grade_summary(req: DataRequest):
    return PredictionService.grade_details(req)


@app.post("/api/predictions/student-details")
def student_summary(req: DataRequest):
    return PredictionService.student_details(req)
