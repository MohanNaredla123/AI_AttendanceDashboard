from backend.classes.DataRequest   import DataRequest
from backend.classes.DataResponse  import DataResponse
from backend.classes.StudentsResponse import StudentsResponse
from backend.app.services.predictions  import (
    cached_students,
    cached_schools,
    cached_districts,
    _zero_response,
    df,
    _subset_pairs,
    _aggregate_metrics,
    _aggregate_trends,
    PRESENT_COL,
    ENROLLED_COL,
    PRED_DIST_COL,
    PRED_SCH_COL,
    PRED_GRD_COL,
    PRED_COL,
    get_current_year,
    get_predicted_year,
    get_historical_years,
    AttendanceValues,
)


class PredictionService:
    @staticmethod
    def students() -> StudentsResponse:
        return {
            "districts": cached_districts,
            "schools": cached_schools,
            "students": cached_students,
        } #type:ignore

    @staticmethod
    def all_districts() -> DataResponse:
        if df.empty:
            return _zero_response()
        hist, pred = _subset_pairs(df)
        cur_year = get_current_year()
        cur_rows = hist[hist["SCHOOL_YEAR"] == cur_year]
        if cur_rows.empty:
            return _zero_response()
        present_tot  = cur_rows[PRESENT_COL].astype(float).sum()
        enrolled_tot = cur_rows[ENROLLED_COL].astype(float).sum()
        prev_att = round((present_tot / enrolled_tot) * 100, 1) if enrolled_tot > 0 else 0
        total_days = round(enrolled_tot / len(cur_rows), 1)
        preds = pred[PRED_DIST_COL].dropna()
        pred_att = round(preds.mean() * 100, 1) if not preds.empty else 0
        metrics = _aggregate_metrics(hist)
        trends  = _aggregate_trends(hist, preds.mean() if not preds.empty else None)
        return DataResponse(
            previousAttendance = prev_att,
            predictedAttendance = pred_att,
            predictedValues = AttendanceValues(
                year=str(get_predicted_year()),
                predictedAttendance=pred_att,
                totalDays=total_days,
            ),
            metrics=metrics,
            trends=trends,
        )

    @staticmethod
    def district(req: DataRequest) -> DataResponse:
        from backend.app.services.predictions import get_district_summary  # type:ignore
        return get_district_summary(req)

    @staticmethod
    def school(req: DataRequest) -> DataResponse:
        from backend.app.services.predictions import get_school_summary # type:ignore
        return get_school_summary(req)

    @staticmethod
    def grade_details(req: DataRequest) -> DataResponse:
        from backend.app.services.predictions import get_grade_summary # type:ignore
        return get_grade_summary(req)

    @staticmethod
    def student_details(req: DataRequest) -> DataResponse:
        from backend.app.services.predictions import get_student_summary # type:ignore
        return get_student_summary(req)
