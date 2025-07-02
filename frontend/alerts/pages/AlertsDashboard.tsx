// import React, { useCallback, useEffect, useReducer } from 'react';
// import { useAuth } from "@/contexts/AuthContext";
// import axiosInstance, { setAuthToken } from "@/lib/axios";
// import { appReducer, initialState, AppState, AppAction } from './reducer';
// import { 
//   processDistrictCode, 
//   extractSchoolCode, 
//   createSearchCriteria, 
//   extractErrorMessage,
//   filterSchoolsByDistrict,
//   filterGradesBySchool
// } from './utils';
// import { 
//   FilterControls, 
//   StatsCard, 
//   AnalysisSection, 
//   DownloadButton 
// } from './components';
// import { Globe, AlertCircle } from 'lucide-react';

// const AlertsDashboard: React.FC = () => {
//   const [state, dispatch] = useReducer(appReducer, initialState);
//   const { token } = useAuth();

//   // Set up axios instance with auth token
//   useEffect(() => {
//     if (token) {
//       setAuthToken(token);
//     }
//   }, [token]);

//   // Fetch initial data on component mount
//   useEffect(() => {
//     fetchInitialData();
    
//     return () => {
//       if (state.loadTimer) {
//         clearTimeout(state.loadTimer);
//       }
//     };
//   }, []);

//   // Fetch schools when district changes
//   useEffect(() => {
//     if (state.filters.district) {
//       const filteredSchools = filterSchoolsByDistrict(
//         state.options.allSchoolOptions, 
//         state.filters.district
//       );
      
//       dispatch({ 
//         type: 'SET_OPTIONS', 
//         payload: { 
//           schoolOptions: filteredSchools,
//           gradeOptions: [] // Reset grades when district changes
//         } 
//       });
      
//       // Reset school filter when district changes
//       if (state.filters.school) {
//         dispatch({ 
//           type: 'SET_FILTER', 
//           payload: { field: 'school', value: '' } 
//         });
//       }
//     }
//   }, [state.filters.district, state.options.allSchoolOptions]);

//   // Fetch grades when school changes
//   useEffect(() => {
//     if (state.filters.school) {
//       // In a real app, you might want to fetch grades from an API here
//       // For now, we'll just use the mock data
//       const filteredGrades = filterGradesBySchool(
//         [], // Replace with actual grades data if available
//         state.filters.school
//       );
      
//       dispatch({ 
//         type: 'SET_OPTIONS', 
//         payload: { gradeOptions: filteredGrades } 
//       });
//     } else {
//       dispatch({ 
//         type: 'SET_OPTIONS', 
//         payload: { gradeOptions: [] } 
//       });
//     }
    
//     if (state.filters.grade && !state.filters.school) {
//       dispatch({ 
//         type: 'SET_FILTER', 
//         payload: { field: 'grade', value: '' } 
//       });
//     }
//   }, [state.filters.school]);

//   /**
//    * Fetches initial filter options and global analysis data
//    */
//   const fetchInitialData = useCallback(async (): Promise<void> => {
//     dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });
//     dispatch({ type: 'CLEAR_ERRORS' });

//     if (state.loadTimer) {
//       clearTimeout(state.loadTimer);
//     }

//     try {
//       // Fetch filter options
//       const filterOptionsRes = await axiosInstance.get('/api/filter-options');
//       const { districts, schools, grades } = filterOptionsRes.data;

//       const formattedDistricts = Array.isArray(districts) 
//         ? districts.map((d: any) => ({
//             ...d,
//             value: d.value.toString().replace(/^D/, ''),
//             label: d.label
//           })) 
//         : [];

//       dispatch({
//         type: 'SET_OPTIONS',
//         payload: {
//           districtOptions: formattedDistricts,
//           allSchoolOptions: schools || []
//         }
//       });

//       // Fetch initial global analysis
//       const searchCriteria = createSearchCriteria({
//         district: "",
//         school: "",
//         grade: ""
//       });

//       const analysisRes = await axiosInstance.post('/api/prediction-insights/', searchCriteria);
//       dispatch({ 
//         type: 'SET_ANALYSIS_DATA', 
//         payload: analysisRes.data 
//       });
      
//       dispatch({ 
//         type: 'SET_UI', 
//         payload: { 
//           isGlobalView: true,
//           showFilters: true
//         } 
//       });
      
//       dispatch({ 
//         type: 'SET_LOADING', 
//         payload: { 
//           isInitialLoad: false,
//           isLoading: false
//         } 
//       });
//     } catch (err: any) {
//       console.error("Error fetching initial data:", err);
      
//       if (!err.message?.includes("starting up")) {
//         dispatch({ 
//           type: 'SET_ERROR', 
//           payload: { 
//             generalError: extractErrorMessage(err) 
//           } 
//         });
//       }
      
//       const timer = setTimeout(() => {
//         fetchInitialData();
//       }, 3000);

//       dispatch({ 
//         type: 'SET_LOAD_TIMER', 
//         payload: timer 
//       });
      
//       dispatch({ 
//         type: 'SET_LOADING', 
//         payload: { 
//           isLoading: false 
//         } 
//       });
//     }
//   }, [state.loadTimer]);

//   /**
//    * Handles filter changes
//    */
//   const handleFilterChange = useCallback((field: keyof AppState['filters'], value: string) => {
//     dispatch({ 
//       type: 'SET_FILTER', 
//       payload: { field, value } 
//     });
//   }, []);

//   /**
//    * Handles search with current filters
//    */
//   const handleSearch = useCallback(async () => {
//     if (!state.filters.district && !state.filters.school && !state.filters.grade) {
//       // If no filters are selected, show global view
//       dispatch({ 
//         type: 'SET_UI', 
//         payload: { isGlobalView: true } 
//       });
//       return;
//     }

//     dispatch({ 
//       type: 'SET_LOADING', 
//       payload: { isLoading: true } 
//     });
    
//     dispatch({ 
//       type: 'CLEAR_ERRORS' 
//     });

//     try {
//       const searchCriteria = createSearchCriteria(state.filters);
//       const analysisRes = await axiosInstance.post('/api/prediction-insights/', searchCriteria);
      
//       dispatch({ 
//         type: 'SET_ANALYSIS_DATA', 
//         payload: analysisRes.data 
//       });
      
//       dispatch({ 
//         type: 'SET_UI', 
//         payload: { 
//           isGlobalView: false 
//         } 
//       });
//     } catch (err: any) {
//       console.error("Error fetching analysis:", err);
      
//       dispatch({ 
//         type: 'SET_ERROR', 
//         payload: { 
//           generalError: extractErrorMessage(err) 
//         } 
//       });
//     } finally {
//       dispatch({ 
//         type: 'SET_LOADING', 
//         payload: { 
//           isLoading: false 
//         } 
//       });
//     }
//   }, [state.filters]);

//   /**
//    * Handles resetting all filters
//    */
//   const handleResetFilters = useCallback(() => {
//     dispatch({ 
//       type: 'RESET_FILTERS' 
//     });
    
//     dispatch({ 
//       type: 'SET_UI', 
//       payload: { 
//         isGlobalView: true 
//       } 
//     });
//   }, []);

//   /**
//    * Handles downloading reports
//    */
//   const handleDownloadReport = useCallback(async () => {
//     dispatch({ 
//       type: 'SET_LOADING', 
//       payload: { 
//         isDownloadingReport: true 
//       } 
//     });
    
//     dispatch({ 
//       type: 'SET_ERROR', 
//       payload: { 
//         downloadError: null 
//       } 
//     });

//     try {
//       const searchCriteria = createSearchCriteria(state.filters);
//       const response = await axiosInstance.post(
//         '/api/download-report/',
//         { ...searchCriteria, report_type: 'detailed' },
//         { responseType: 'blob' }
//       );

//       // Create a download link and trigger download
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', 'student_report.xlsx');
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//     } catch (err: any) {
//       console.error("Error downloading report:", err);
      
//       dispatch({ 
//         type: 'SET_ERROR', 
//         payload: { 
//           downloadError: extractErrorMessage(err) 
//         } 
//       });
//     } finally {
//       dispatch({ 
//         type: 'SET_LOADING', 
//         payload: { 
//           isDownloadingReport: false 
//         } 
//       });
//     }
//   }, [state.filters]);

//   // Show loading state
//   if (state.loading.isInitialLoad) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   // Show error state
//   if (state.errors.generalError) {
//     return (
//       <div className="bg-red-50 border-l-4 border-red-400 p-4">
//         <div className="flex">
//           <div className="flex-shrink-0">
//             <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
//           </div>
//           <div className="ml-3">
//             <p className="text-sm text-red-700">{state.errors.generalError}</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-6">Student Performance Dashboard</h1>
      
//       <FilterControls
//         state={state}
//         dispatch={dispatch}
//         onFilterChange={handleFilterChange}
//         onSearch={handleSearch}
//         onReset={handleResetFilters}
//       />
      
//       {state.analysisData && (
//         <>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//             <StatsCard
//               title="Total Students"
//               value={state.analysisData.summary_statistics.total_students}
//               icon={<Globe className="w-6 h-6" />}
//             />
//             <StatsCard
//               title="Below 85%"
//               value={state.analysisData.summary_statistics.below_85_students}
//               icon={<AlertCircle className="w-6 h-6" />}
//               className="bg-yellow-50"
//             />
//             <StatsCard
//               title="Tier 1 Students"
//               value={state.analysisData.summary_statistics.tier1_students}
//               icon={<AlertCircle className="w-6 h-6" />}
//               className="bg-red-50"
//             />
//             <StatsCard
//               title="Tier 4 Students"
//               value={state.analysisData.summary_statistics.tier4_students}
//               icon={<AlertCircle className="w-6 h-6" />}
//               className="bg-green-50"
//             />
//           </div>
          
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//             <AnalysisSection
//               title="Key Insights"
//               items={state.analysisData.key_insights}
//               emptyMessage="No insights available for the selected filters."
//               icon={<AlertCircle className="w-5 h-5" />}
//             />
            
//             <AnalysisSection
//               title="Recommendations"
//               items={state.analysisData.recommendations}
//               emptyMessage="No recommendations available for the selected filters."
//               icon={<AlertCircle className="w-5 h-5" />}
//             />
//           </div>
          
//           <div className="flex justify-end mt-6">
//             <DownloadButton
//               onClick={handleDownloadReport}
//               disabled={!state.analysisData}
//               isDownloading={state.loading.isDownloadingReport}
//             />
            
//             {state.errors.downloadError && (
//               <div className="ml-4 text-red-600 text-sm">
//                 {state.errors.downloadError}
//               </div>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default AlertsDashboard;
import React, { useState, useEffect, useReducer, useCallback } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import axiosInstance, { setAuthToken } from "@/lib/axios";

// Local imports
import { 
  appReducer, 
  initialState, 
  FilterState,
  SchoolOption,
  GradeOption,
  DistrictOption,
  AnalysisData,
  DownloadCriteria,
  ApiError
} from './reducer';
import { createSearchCriteria, extractErrorMessage } from './utils';
import {
  LoadingSkeletonCards,
  ReportDownloadingModal,
  FilterSection,
  SummaryCards,
  InsightsAndRecommendations,
  StatusNotifications
} from './components';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AlertsDashboard: React.FC = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { token } = useAuth();

  // ============================================================================
  // DATA FETCHING FUNCTIONS
  // ============================================================================

  /**
   * Fetches initial filter options and global analysis data
   */
  const fetchInitialData = useCallback(async (): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });
    dispatch({ type: 'CLEAR_ERRORS' });

    if (state.loadTimer) {
      clearTimeout(state.loadTimer);
    }

    try {
      // Fetch filter options
      try {
        console.log('Fetching filter options...');
        const filterOptionsRes = await axiosInstance.get('/api/filter-options');
        const { districts, schools, grades } = filterOptionsRes.data;

        const formattedDistricts: DistrictOption[] = Array.isArray(districts) 
          ? districts.map((d: any) => ({
              ...d,
              value: d.value.toString().replace(/^D/, ''),
              label: d.label
            })) 
          : [];

        dispatch({
          type: 'SET_OPTIONS',
          payload: {
            districtOptions: formattedDistricts,
            allSchoolOptions: schools || []
          }
        });

        // Set filtered options if filters are already selected
        if (state.filters.district) {
          const filteredSchools = (schools || []).filter((s: SchoolOption) => s.district === state.filters.district);
          dispatch({ type: 'SET_OPTIONS', payload: { schoolOptions: filteredSchools } });

          if (state.filters.school) {
            const filteredGrades = (grades || []).filter((g: GradeOption) => g.school === state.filters.school);
            dispatch({ type: 'SET_OPTIONS', payload: { gradeOptions: filteredGrades } });
          }
        }
      } catch (err) {
        console.error("Error fetching filter options:", err);
        dispatch({ 
          type: 'SET_ERROR', 
          payload: { generalError: "Failed to load filter options. Please try again." } 
        });
      }

      // Fetch initial global analysis
      try {
        const searchCriteria = {
          district_name: "",
          gradelevel: "",
          school_name: "",
          student_id: ""
        };

        const analysisRes = await axiosInstance.post('/api/prediction-insights/', searchCriteria);
        dispatch({ type: 'SET_ANALYSIS_DATA', payload: analysisRes.data });
        dispatch({ type: 'SET_UI', payload: { isGlobalView: true } });
        dispatch({ type: 'SET_LOADING', payload: { isInitialLoad: false } });
      } catch (analysisErr: any) {
        console.error("Error fetching analysis:", analysisErr);
        if (!analysisErr.message?.includes("starting up")) {
          dispatch({ 
            type: 'SET_ERROR', 
            payload: { generalError: "Failed to load initial data. Please try again." } 
          });
        }
      }
    } catch (err) {
      console.error("Error fetching initial data:", err);

      const timer = setTimeout(() => {
        fetchInitialData();
      }, 3000);

      dispatch({ type: 'SET_LOAD_TIMER', payload: timer });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
    }
  }, [state.loadTimer, state.filters.district, state.filters.school]);

  /**
   * Fetches schools for selected district
   */
  const fetchSchoolsForDistrict = useCallback(async (district: string): Promise<void> => {
    if (!district) {
      dispatch({ 
        type: 'SET_OPTIONS', 
        payload: { schoolOptions: [] } 
      });
      return;
    }

    try {
      const response = await axiosInstance.get('/api/filters/schools', {
        params: { district }
      });

      const filteredSchools: SchoolOption[] = response.data.map((school: any) => ({
        ...school,
        key: `school-${school.value}`,
        location_id: school.location_id || school.value.split('-').pop()
      }));

      dispatch({ type: 'SET_OPTIONS', payload: { schoolOptions: filteredSchools } });

      // Reset school if no longer valid
      const currentSchoolValid = state.filters.school && 
        filteredSchools.some((s: SchoolOption) => s.value === state.filters.school);
      
      if (state.filters.school && !currentSchoolValid) {
        dispatch({ type: 'SET_FILTER', payload: { field: 'school', value: '' } });
        dispatch({ type: 'SET_FILTER', payload: { field: 'grade', value: '' } });
      }
    } catch (error) {
      console.error('Error fetching schools for district:', error);
      dispatch({ 
        type: 'SET_OPTIONS', 
        payload: { schoolOptions: [] } 
      });
      dispatch({ type: 'SET_FILTER', payload: { field: 'school', value: '' } });
      dispatch({ type: 'SET_FILTER', payload: { field: 'grade', value: '' } });
    }
  }, [state.filters.school]);

  /**
   * Fetches grades for selected school
   */
  const fetchGradesForSchool = useCallback(async (school: string, district: string): Promise<void> => {
    if (!school) {
      dispatch({ 
        type: 'SET_OPTIONS', 
        payload: { gradeOptions: [] } 
      });
      dispatch({ type: 'SET_FILTER', payload: { field: 'grade', value: '' } });
      return;
    }

    const selectedSchool = state.options.schoolOptions.find(s => s.value === school);
    if (!selectedSchool) {
      dispatch({ 
        type: 'SET_OPTIONS', 
        payload: { gradeOptions: [] } 
      });
      dispatch({ type: 'SET_FILTER', payload: { field: 'grade', value: '' } });
      return;
    }

    try {
      dispatch({ 
        type: 'SET_OPTIONS', 
        payload: { gradeOptions: [{ value: "loading", label: "Loading grades...", school, district }] } 
      });

      const schoolParts = school.split('-');
      const schoolId = schoolParts.length > 1 ? school : `${district || ''}-${school}`;

      const response = await axiosInstance.get('/api/filters/grades', {
        params: { school: schoolId, district: district || '' }
      });

      const grades = Array.isArray(response.data) ? response.data : [];
      const formattedGrades: GradeOption[] = grades.map((g: any) => ({
        value: g.value.toString(),
        label: g.label,
        school,
        district: district || ''
      }));

      dispatch({ type: 'SET_OPTIONS', payload: { gradeOptions: formattedGrades } });

      // Reset grade if no longer valid
      if (state.filters.grade && !formattedGrades.some(g => g.value === state.filters.grade)) {
        dispatch({ type: 'SET_FILTER', payload: { field: 'grade', value: '' } });
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
      dispatch({ 
        type: 'SET_OPTIONS', 
        payload: { gradeOptions: [] } 
      });
      dispatch({ type: 'SET_FILTER', payload: { field: 'grade', value: '' } });
    }
  }, [state.options.schoolOptions, state.filters.grade]);

  /**
   * Fetches analysis data based on current filters
   */
  const fetchAnalysisData = useCallback(async (): Promise<AnalysisData | undefined> => {
    dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });
    dispatch({ type: 'CLEAR_ERRORS' });
    dispatch({ type: 'SET_UI', payload: { isGlobalView: false } });

    try {
      const searchCriteria = createSearchCriteria(state.filters);
      
      console.log('Sending request to /api/prediction-insights/ with data:', JSON.stringify(searchCriteria, null, 2));
      
      const res = await axiosInstance.post('/api/prediction-insights/', searchCriteria, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Received response:', res.status, res.data);
      
      dispatch({ type: 'SET_ANALYSIS_DATA', payload: res.data });
      dispatch({ type: 'CLEAR_ERRORS' });
      return res.data;
    } catch (err: any) {
      console.error("Error fetching analysis:", err);
      const errorMessage = extractErrorMessage(err as ApiError);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { generalError: errorMessage } 
      });
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
    }
  }, [state.filters]);

  /**
   * Resets all filters and fetches global data
   */
  const resetFiltersAndFetchGlobal = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });
      dispatch({ type: 'CLEAR_ERRORS' });
      dispatch({ type: 'RESET_FILTERS' });
      dispatch({ 
        type: 'SET_OPTIONS', 
        payload: { gradeOptions: [] } 
      });

      const searchCriteria = {
        district_code: undefined,
        grade_code: undefined,
        school_code: undefined
      };

      const [analysisRes, schoolsRes] = await Promise.all([
        axiosInstance.post('/api/prediction-insights/', searchCriteria),
        axiosInstance.get('/api/filters/schools')
      ]);

      const uniqueSchools = schoolsRes.data.reduce((acc: SchoolOption[], school: SchoolOption) => {
        const uniqueKey = `school-${school.district || 'none'}-${school.value}`;
        if (!acc.some(s => s.key === uniqueKey)) {
          acc.push({ ...school, key: uniqueKey });
        }
        return acc;
      }, []);

      dispatch({ type: 'SET_OPTIONS', payload: { schoolOptions: uniqueSchools } });
      dispatch({ type: 'SET_ANALYSIS_DATA', payload: analysisRes.data });
      dispatch({ type: 'SET_UI', payload: { isGlobalView: true } });
    } catch (err) {
      console.error("Error resetting analysis:", err);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { generalError: "Failed to reset data. Please try again." } 
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
    }
  }, []);

  /**
   * Downloads a report of specified type
   */
  const downloadReport = useCallback(async (reportType: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { isDownloadingReport: true } });
      dispatch({ type: 'SET_ERROR', payload: { downloadError: null } });

      const downloadCriteria: DownloadCriteria = {
        ...createSearchCriteria(state.filters),
        report_type: reportType
      };

      console.log('Download criteria:', downloadCriteria);

      const res = await axiosInstance.post(`/api/download/report/${reportType}`, downloadCriteria, {
        responseType: 'blob'
      });

      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendance_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Error in downloadReport:', err);
      const errorMessage = extractErrorMessage(err as ApiError);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { downloadError: `Error downloading report: ${errorMessage}` } 
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { isDownloadingReport: false } });
    }
  }, [state.filters]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleFilterChange = useCallback((field: keyof FilterState, value: string) => {
    dispatch({ type: 'SET_FILTER', payload: { field, value } });
  }, []);

  const handleToggleFilters = useCallback(() => {
    dispatch({ 
      type: 'SET_UI', 
      payload: { showFilters: !state.ui.showFilters } 
    });
  }, [state.ui.showFilters]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Set auth token when it changes
  useEffect(() => {
    if (token) {
      setAuthToken(token);
    }
  }, [token]);

  // Fetch initial data on mount
  useEffect(() => {
    fetchInitialData();

    return () => {
      if (state.loadTimer) {
        clearTimeout(state.loadTimer);
      }
    };
  }, []);

  // Fetch schools when district changes
  useEffect(() => {
    fetchSchoolsForDistrict(state.filters.district);
  }, [state.filters.district, fetchSchoolsForDistrict]);

  // Fetch grades when school changes
  useEffect(() => {
    fetchGradesForSchool(state.filters.school, state.filters.district);
  }, [state.filters.school, state.filters.district, fetchGradesForSchool]);

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50/50 relative">
      {/* Download Progress Modal */}
      {state.loading.isDownloadingReport && <ReportDownloadingModal />}

      <div className="container mx-auto px-4 py-4 max-w-full">
        {/* Header Section */}
        <div className="mb-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div>
              <h1 className="text-2xl font-bold">Alerts Dashboard</h1>
              <p className="text-sm text-muted-foreground">Monitor alerts and notifications</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleFilters}
                className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                aria-label={state.ui.showFilters ? "Hide filters" : "Show filters"}
              >
                {state.ui.showFilters ? "Hide Filters" : "Show Filters"}
                {state.ui.showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>
          <div className="w-full h-0.5 bg-gray-200 mt-2"></div>
        </div>

        <div className="flex w-full min-h-screen flex-col lg:flex-row gap-4">
          {/* Filter Section */}
          {state.ui.showFilters && (
            <FilterSection
              state={state}
              onFilterChange={handleFilterChange}
              onSearch={fetchAnalysisData}
              onReset={resetFiltersAndFetchGlobal}
              onDownloadReport={downloadReport}
            />
          )}

          {/* Main Dashboard */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex flex-col gap-4">
              {/* Status Notifications */}
              <StatusNotifications state={state} />
              
              {/* Dashboard Content */}
              {!state.loading.isLoading && !state.loading.isInitialLoad && state.analysisData && (
                <>
                  <SummaryCards 
                    analysisData={state.analysisData} 
                    onDownloadReport={downloadReport} 
                  />
                  <InsightsAndRecommendations analysisData={state.analysisData} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsDashboard;