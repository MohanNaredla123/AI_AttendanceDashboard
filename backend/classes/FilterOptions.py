from pydantic import BaseModel
from typing import List, Dict


class FilterOptions(BaseModel):
    districts: List[Dict[str, str]]
    schools: List[Dict[str, str]]
    grades: List[Dict[str, str]]
