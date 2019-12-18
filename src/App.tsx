import React, { useState, useEffect, useRef } from "react";
import { useMachine } from "@xstate/react";
import { endpoint } from "./config";
import { fetchListings } from "./fetchListings";
import { TListing } from "./types";
import { appMachine } from "./machines";
import { Container } from "@tone-row/slang";
require("isomorphic-unfetch");

const { format } = new Intl.NumberFormat("fr-CA", {
  style: "currency",
  currency: "CAD"
});

const App: React.FC = () => {
  const [current, send] = useMachine(appMachine);
  const [interval, _setInterval] = useState<undefined | number>(undefined);
  const [listings, setListings] = useState<TListing[]>([]);
  const [lastId, setLastId] = useState();
  const [permission, setPermission] = useState(false);
  const timer = useRef(new Worker("timer.js"));
  const handleSetInterval = (e: React.FormEvent<HTMLInputElement>) => {
    const newInterval = e.currentTarget.value;
    if (typeof newInterval === "string" && newInterval) {
      _setInterval(parseInt(newInterval, 10));
      send("SET_INTERVAL");
    } else {
      send("TO_IDLE");
    }
  };

  useEffect(() => {
    let t = timer.current;
    t.onmessage = e => {
      send(e.data);
    };
    return () => {
      t.onmessage = null;
    };
  }, [send]);

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission().then(function(permission) {
        if (permission === "granted") {
          setPermission(true);
        }
      });
    } else {
      setPermission(true);
    }
  }, []);

  useEffect(() => {
    async function f() {
      let newListings;
      try {
        newListings = await fetchListings(
          endpoint,
          listings.length ? listings[0].id : undefined
        );
        setLastId(listings.length ? listings[0].id : undefined);
        setListings([...newListings, ...listings]);
        if (newListings.length) {
          new Notification(`${newListings.length} New Listings`);
        }
        send("FINISH");
      } catch (err) {
        send("FETCH_ERROR");
      }
    }
    if (current.value === "updating") {
      send("FETCH");
      f();
    }
  }, [current.value, send, listings, lastId]);

  useEffect(() => {
    if (current.value === "setTimer" && interval) {
      timer.current.postMessage(["start", interval * 60 * 1000]);
      send("TIME");
    }
  }, [current.value, interval, send]);

  const newListings = lastId
    ? listings.slice(
        0,
        listings.findIndex(L => L.id === lastId)
      )
    : listings;
  const oldListings = lastId
    ? listings.slice(listings.findIndex(L => L.id === lastId))
    : [];
  return (
    <div className="App">
      <Container w="650px">
        {permission ? (
          <>
            <h2>Search</h2>
            <input type="text" value={endpoint} readOnly />
            <h2>Set Interval</h2>
            <input
              min="1"
              max="60"
              type="number"
              onChange={handleSetInterval}
            />{" "}
            {interval && "Minutes"}
            <h2>New Listings ({newListings.length})</h2>
            {newListings.map(listing => (
              <div key={listing.id}>
                <strong>
                  <a
                    href={`https://www.kijiji.ca${listing.link}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="price">{format(listing.price)}</span>
                    <span className="title">{listing.title}</span>
                  </a>
                </strong>
              </div>
            ))}
            {oldListings.map(listing => (
              <div key={listing.id}>
                <a
                  href={`https://www.kijiji.ca${listing.link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="price">{format(listing.price)}</span>
                  <span className="title">{listing.title}</span>
                </a>
              </div>
            ))}
          </>
        ) : (
          <h1>You must enable notifications</h1>
        )}
      </Container>
    </div>
  );
};

export default App;
