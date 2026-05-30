import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function PredictionHistory() {

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {

    try {

      const response =
        await API.get(
          "/prediction-history"
        );

      console.log(
        "History:",
        response.data
      );

      setHistory(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch(error) {

      console.log(
        "History Error:",
        error.response?.data
      );

    } finally {

      setLoading(false);

    }
  };

  return (

    <div className="p-6 min-h-screen">

      <h1 className="text-3xl font-bold text-white mb-6">
        Prediction History
      </h1>

      {loading ? (

        <p className="text-white">
          Loading...
        </p>

      ) : history.length === 0 ? (

        <div className="glass-card p-6 rounded-xl text-white">
          No prediction history available
        </div>

      ) : (

        <div className="space-y-4">

          {history.map((item,index)=>(

            <div
              key={index}
              className="glass-card p-5 rounded-xl"
            >

              <p className="text-white">
                Prediction:
                <span className="text-cyan-400 ml-2">
                  {item.prediction_result}
                </span>
              </p>

              <p className="text-white">
                Risk:
                <span className="ml-2">
                  {item.risk_level}
                </span>
              </p>

              <p className="text-white">
                Probability:
                <span className="ml-2">
                  {(item.probability*100).toFixed(2)}%
                </span>
              </p>

              <p className="text-gray-400 mt-2">
                {new Date(
                  item.created_at
                ).toLocaleString()}
              </p>

            </div>

          ))}

        </div>

      )}

    </div>

  );
}