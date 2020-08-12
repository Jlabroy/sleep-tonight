import React, { useState } from "react";
import { useForm } from "react-hook-form";
import useFetch from "use-http";
import cityMap from "city-lat-long-map";
import { upperCaseFirst } from "upper-case-first";
import "./App.css";

const API_KEY = "0ffcaa1c0d9c3570652fad8407bef54a";

const getIfICanSleep = (weatherData: {
  hourly: { dt: number; temp: number }[];
}) => {
  const nightHours = weatherData.hourly.filter(({ dt }) => {
    const date = new Date(dt * 1000);
    const hours = date.getHours();

    return hours > 20 || hours < 7;
  });

  return Math.floor(
    nightHours.reduce((prev, cur) => prev + cur.temp, 0) / nightHours.length
  );
};

function App() {
  const [nightTemp, setNightTemp] = useState<number | undefined>();

  const { get, loading, error } = useFetch(
    "https://api.openweathermap.org/data/2.5"
  );
  const { handleSubmit, register, errors } = useForm<{ city: string }>();

  const onSubmit = async (data: any) => {
    const coords = cityMap[upperCaseFirst(data.city)];
    if (coords) {
      const nightTemp = await get(
        `/onecall?lat=${coords.lat}&lon=${coords.lng}&units=metric&exclude=minutely,daily&appid=${API_KEY}`
      );

      setNightTemp(getIfICanSleep(nightTemp));
    }
  };

  const isSleeping = nightTemp && nightTemp < 20;

  return (
    <div
      className={`App ${isSleeping && "App--state-sleeping"} ${
        nightTemp && !isSleeping && "App--state-unrest"
      }`}
    >
      {!!error && (
        <div className="banner banner--state-error">
          There was an error loading your request.
        </div>
      )}
      <header className="App-header">
        {nightTemp && isSleeping && (
          <div>
            <h1>Yes!</h1>
            The average temperature tonight is{" "}
            <span className="highlight">{nightTemp}°C</span>, you should sleep
            well!
          </div>
        )}
        {nightTemp && !isSleeping && (
          <div>
            <h1>Nope!</h1>
            <div className="margin--bottom-16">
              Yikes! The average temperature tonight is{" "}
              <span className="highlight">{nightTemp}°C</span>.
            </div>
            <div className="type--size-12">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.sleepfoundation.org/bedroom-environment/touch/what-temperature-should-your-bedroom-be#:~:text=Many%20sleep%20experts%20say%20that,temperature%20rises%20and%20falls%20slightly."
              >
                Research
              </a>{" "}
              suggests optimal sleeping temperature is 18°C.
            </div>
          </div>
        )}
        {!nightTemp && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div>
              <input
                type="text"
                name="city"
                ref={register({ required: true })}
                placeholder="Enter your city"
                className={`input margin--bottom-16 ${
                  errors.city && "input--state-error"
                }`}
              />
              {errors.city && (
                <div className="banner banner--state-error margin--bottom-16">
                  Please enter your city!
                </div>
              )}
            </div>
            <button disabled={loading} className="button button--primary">
              Will I Sleep Tonight?
            </button>
          </form>
        )}
      </header>
    </div>
  );
}

export default App;
