import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import qs from "query-string";
import useFetch from "use-http";
import { IoMdClose } from "react-icons/io";
import {
  EmailShareButton,
  EmailIcon,
  FacebookShareButton,
  FacebookIcon,
  LinkedinShareButton,
  LinkedinIcon,
  RedditShareButton,
  RedditIcon,
  TwitterShareButton,
  TwitterIcon,
  WhatsappShareButton,
  WhatsappIcon,
} from "react-share";
import "./App.css";

const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
const MAPS_API_KEY = process.env.REACT_APP_MAPS_API_KEY;

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

const appUrl = "https://will-i-sleep-tonight.com/";

function App() {
  const { city } = qs.parse(window.location.search);

  const [nightTemp, setNightTemp] = useState<number | undefined>();
  const [isSharing, setIsSharing] = useState(false);
  const [locationError, setLocationError] = useState("");

  const { get, loading, error } = useFetch(
    "https://api.openweathermap.org/data/2.5"
  );
  const { get: getCoords } = useFetch(
    "https://maps.googleapis.com/maps/api/geocode"
  );
  const { handleSubmit, register, errors } = useForm<{ city: string }>();

  useEffect(() => {
    const fetchData = async () => {
      if (city && typeof city === "string") {
        const coords = await getCoords(`/json?address=${city}&key=${MAPS_API_KEY}`);

        if (!coords?.results?.length) {
          setLocationError("Couldn't find your city, please try another");
          return;
        }

        const { lat, lng } = coords.results[0].geometry.location;

        const nightTemp = await get(
          `/onecall?lat=${lat}&lon=${lng}&units=metric&exclude=minutely,daily&appid=${API_KEY}`
        );

        setNightTemp(getIfICanSleep(nightTemp));
      }
    };

    setLocationError("");
    fetchData();
  }, [city, get, getCoords]);

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
      {isSharing && (
        <header className="App-share">
          <IoMdClose className="close" onClick={() => setIsSharing(false)} />
          <h1>Share</h1>
          <div className="share-icons">
            <EmailShareButton
              url={appUrl}
              subject={`I'm going ${
                !isSleeping ? "to not" : ""
              } to sleep tonight!`}
              body={`I'm not sleeping as its ${nightTemp}°C where I live tonight. Check if you're going to be able to sleep at ${appUrl}`}
            >
              <EmailIcon />
            </EmailShareButton>
            <FacebookShareButton
              url={appUrl}
              quote={`I'm not sleeping as its ${nightTemp}°C where I live tonight. Check if you're going to be able to sleep at ${appUrl}`}
            >
              <FacebookIcon />
            </FacebookShareButton>
            <LinkedinShareButton
              url={appUrl}
              title={`I'm going ${
                !isSleeping ? "to not" : ""
              } to sleep tonight!`}
              summary={`I'm not sleeping as its ${nightTemp}°C where I live tonight. Check if you're going to be able to sleep at ${appUrl}`}
            >
              <LinkedinIcon />
            </LinkedinShareButton>
            <RedditShareButton
              url={appUrl}
              title={`I'm going ${
                !isSleeping ? "to not" : ""
              } to sleep tonight!`}
            >
              <RedditIcon />
            </RedditShareButton>
            <TwitterShareButton
              url={appUrl}
              title={`I'm going ${
                !isSleeping ? "to not" : ""
              } to sleep tonight!`}
            >
              <TwitterIcon />
            </TwitterShareButton>
            <WhatsappShareButton
              url={appUrl}
              title={`I'm going ${
                !isSleeping ? "to not" : ""
              } to sleep tonight!`}
            >
              <WhatsappIcon />
            </WhatsappShareButton>
          </div>
        </header>
      )}
      {!isSharing && (
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
            <form
              onSubmit={handleSubmit((data: any) => {
                window.history.replaceState(
                  {},
                  "",
                  `${window.location.pathname}?city=${data.city}`
                );
              })}
            >
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
                {locationError && (
                  <div className="banner banner--state-error margin--bottom-16">
                    {locationError}
                  </div>
                )}
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
          {nightTemp && (
            <>
              <div className="margin--top-32 margin--bottom-16">
                <button
                  className="button button--secondary"
                  onClick={() => {
                    setNightTemp(undefined);

                    window.history.replaceState(
                      {},
                      "",
                      `${window.location.pathname}`
                    );
                  }}
                >
                  Try another city
                </button>
              </div>
              <button
                className="button button--tertiary"
                onClick={() => setIsSharing(true)}
              >
                Share
              </button>
            </>
          )}
        </header>
      )}
    </div>
  );
}

export default App;
