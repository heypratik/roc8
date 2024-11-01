import React, { useState, useEffect } from "react";
import { registerLicense } from "@syncfusion/ej2-base";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { useRouter } from "next/router";
import { getSession, signOut } from 'next-auth/react'
import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Inject,
  Legend,
  Category,
  Tooltip,
  DataLabel,
  BarSeries,
  LineSeries,
  DateTimeCategory,
  Zoom,
} from "@syncfusion/ej2-react-charts";
import Cookies from "js-cookie";
registerLicense("Ngo9BigBOggjHTQxAR8/V1NDaF5cWWtCf1JpQnxbf1x0ZFRGallYTnVeUiweQnxTdEFiWXxfcXRQT2NdVUxzWQ==");

function Charts({session}) {
  const router = useRouter();
  console.log(session)

  const parseDate = (dateString, fallback) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? fallback : date;
  };

  const [filters, setFilters] = useState({
    gender: Cookies.get("gender") ? Cookies.get("gender").split(",") : ["Male", "Female"],
    age: Cookies.get("age") ? Cookies.get("age").split(",") : [">25"],
    startDate: parseDate(Cookies.get("startDate") , new Date("2022-10-20")),
    endDate: parseDate(Cookies.get("endDate"), new Date("2022-10-29")),
  });

  const [trueData, setTrueData] = useState(null);
  const [lineChartData, setLineChartData] = useState(null);
  const [trueLineChart, setTrueLineChart] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(Cookies.get("selectedFeature") || null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    Cookies.set("gender", filters.gender.join(","));
    Cookies.set("age", filters.age.join(","));
    Cookies.set("startDate", filters.startDate.toISOString().split("T")[0]);
    Cookies.set("endDate", filters.endDate.toISOString().split("T")[0]);

    const queryParams = new URLSearchParams();
    filters.gender.forEach((gender) => queryParams.append("gender", gender));
    filters.age.forEach((age) => queryParams.append("age", age));
    queryParams.append("startDate", filters.startDate.toISOString().split("T")[0]);
    queryParams.append("endDate", filters.endDate.toISOString().split("T")[0]);

    router.push(
      {
        pathname: "/charts",
        search: queryParams.toString(),
      },
      undefined,
      { shallow: true }
    );
  }, [filters]);

  useEffect(() => {
    if (router.isReady) {
      const { gender, age, startDate, endDate } = router.query;
      setFilters({
        gender: Array.isArray(gender) ? gender : gender ? [gender] : filters.gender,
        age: Array.isArray(age) ? age : age ? [age] : filters.age,
        startDate: parseDate(startDate, filters.startDate),
        endDate: parseDate(endDate, filters.endDate),
      });
    }
  }, [router.isReady]);

  const fetchData = async () => {
    const response = await fetch(`/api/charts?${new URLSearchParams(filters)}`);
    const data = await response.json();
    setTrueData(data.totalTimeSpent);
    setLineChartData(data.lineChartData);

    if (selectedFeature) {
      const lcd = data.lineChartData.map((elem) => clearObj(selectedFeature, elem));
      setTrueLineChart(lcd);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters, selectedFeature]);

  const primaryxAxis = { valueType: "Category", title: "Feature" };
  const primaryyAxis = { title: "Total Time Spent", labelFormat: "{value}" };
  const primaryxAxisLine = { valueType: "DateTimeCategory", title: "Date", intervalType: "Days", labelFormat: "dd/MM/yyyy" };
  const zoomSettings = {
    enableSelectionZooming: true,
    enablePan: true,
    enablePinchZooming: true,
    enableMouseWheelZooming: true,
    mode: 'X', 
  };

  const handleCheckboxChange = (filterType, value) => {
    setFilters((prevFilters) => {
      const updatedFilter = prevFilters[filterType].includes(value)
        ? prevFilters[filterType].filter((item) => item !== value)
        : [...prevFilters[filterType], value];
      return { ...prevFilters, [filterType]: updatedFilter };
    });
  };

  const clearObj = (str, obj) => {
    const newObj = { ...obj };
    for (const [key, value] of Object.entries(newObj)) {
      if (key === "Day") {
        const dateObj = new Date(String(newObj[key]).split("/").reverse().join("-"));
        newObj["Day"] = dateObj;
      }
      if (key !== str && key !== "Day") {
        delete newObj[key];
      }
    }
    for (const [key, value] of Object.entries(newObj)) {
      if (key === str) {
        newObj["y"] = newObj[key];
      }
    }
    return newObj;
  };

  const onBarClick = (args) => {
    const clickedFeature = trueData[args.pointIndex]?.feature;
    if (clickedFeature) {
      Cookies.set("selectedFeature", clickedFeature);
      setSelectedFeature(clickedFeature);

      const lcd = lineChartData.map((elem) => clearObj(clickedFeature, elem));
      setTrueLineChart(lcd);
    }
  };

  const message = isHydrated ? (selectedFeature ? 
    `Displaying line chart data for the feature: ${selectedFeature}` : 
    "No feature selected for line chart.") 
    : "";

    async function logout() {
      await signOut({ callbackUrl: '/login' });
      router.push("/login")
    }

  return (
    <div className="bg-white text-black p-4 min-h-screen">
      <div className="  top-0 right-0 w-full bg-white border-b border-{#636363] flex items-center justify-between px-4 pb-4"><p>Welcome Demo!</p><button className="bg-gray-200 border-[#636363] p-2" onClick={() => logout()}>Signout</button></div>
      <h1 className="text-center text-3xl font-bold py-8">Sensitive Data Chart🤫</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/3 bg-white border border-gray-200 p-6 rounded-lg">
          <div className="text-lg font-semibold mb-4">Filters</div>
          <div className="mb-6">
            <label className="block font-medium mb-2">Gender</label>
            {["Male", "Female"].map((gender) => (
              <label key={gender} className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  value={gender}
                  checked={filters.gender.includes(gender)}
                  onChange={() => handleCheckboxChange("gender", gender)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                {gender}
              </label>
            ))}
          </div>
          <div className="mb-6">
            <label className="block font-medium mb-2">Age</label>
            {["15-25", ">25"].map((age) => (
              <label key={age} className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  value={age}
                  checked={filters.age.includes(age)}
                  onChange={() => handleCheckboxChange("age", age)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                {age}
              </label>
            ))}
          </div>
          <div className="mb-6">
            <label className="block font-medium mb-2">Start Date</label>
            <DatePicker
              selected={filters.startDate}
              onChange={(date) => setFilters((prev) => ({ ...prev, startDate: date }))}
              dateFormat="yyyy-MM-dd"
              className="border border-gray-300 rounded-lg p-2 w-full"
            />
          </div>
          <div className="mb-6">
            <label className="block font-medium mb-2">End Date</label>
            <DatePicker
              selected={filters.endDate}
              onChange={(date) => setFilters((prev) => ({ ...prev, endDate: date }))}
              dateFormat="yyyy-MM-dd"
              className="border border-gray-300 rounded-lg p-2 w-full"
            />
          </div>
        </div>

        <div className="flex-1 space-y-6">
        <div className="p-4  border border-gray-200  bg-white rounded-lg min-h-96">
        <ChartComponent id='charts' primaryXAxis={primaryxAxis} primaryYAxis={primaryyAxis} pointClick={onBarClick}>
                        <Inject services={[BarSeries, Legend, Tooltip, DataLabel, Category]} />
                        <SeriesCollectionDirective>
                            <SeriesDirective dataSource={trueData} xName='feature' yName='total' type='Bar' />
                        </SeriesCollectionDirective>
                    </ChartComponent>
        </div>

          <div className="p-4  border border-gray-200  bg-white rounded-lg min-h-96">
            {trueLineChart ? (
              <ChartComponent id="chart2" primaryXAxis={primaryxAxisLine} zoomSettings={zoomSettings}>
                <Inject services={[LineSeries, Legend, Tooltip, DataLabel, Category, DateTimeCategory, Zoom]} />
                <SeriesCollectionDirective>
                  <SeriesDirective dataSource={trueLineChart} xName="Day" yName="y" width={2} type="Line" />
                </SeriesCollectionDirective>
              </ChartComponent>
            ) : (
              <p className="text-gray-600 text-center">Click on a bar to view data for that feature</p>
            )}
          </div>

          <div className="p-4 bg-gray-100 border-t border-gray-300 rounded-b-lg">
            <p className="text-lg font-semibold text-black">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Charts;

export async function getServerSideProps(context) {

  const session = await getSession(context)
  console.log(session)

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  return {
    props: {
        session
    },
  }
}