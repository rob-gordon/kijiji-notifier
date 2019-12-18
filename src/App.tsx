import React, { useState, useEffect } from "react";
import { useMachine } from "@xstate/react";
import { endpoint } from "./config";
import { fetchListings } from "./fetchListings";
import { TListing } from "./types";
import { appMachine } from "./machines";
require("isomorphic-unfetch");

const App: React.FC = () => {
  const [current, send] = useMachine(appMachine);
  const [interval, _setInterval] = useState<undefined | number>(undefined);
  const [listings, setListings] = useState<TListing[]>([]);
  const [lastId, setLastId] = useState();
  const [permission, setPermission] = useState(false);
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
  window.setLastId = setLastId;
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
      setTimeout(() => {
        send("UPDATE");
      }, interval * 60 * 1000);
      send("TIME");
    }
  }, [current.value, interval, send]);

  const newListings = listings.slice(
    0,
    listings.findIndex(L => L.id === lastId)
  );
  return (
    <div className="App">
      {permission ? (
        <>
          <h1>{current.value}</h1>
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
              <span className="price">{listing.price}</span>
              <span className="title">{listing.title}</span>
            </div>
          ))}
        </>
      ) : (
        <h1>You must enable notifications</h1>
      )}
    </div>
  );
};

export default App;
