import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarLoader } from "react-spinners";
import { Button } from '../components/ui/button';
import { Filter } from 'lucide-react';
import { UrlState } from "@/context";
import useFetch from "@/hooks/use-fetch";
import { getUrls } from "@/db/apiUrls";
import { Input } from "@/components/ui/input";
import { getClicksForUrls } from '../db/apiClicks';
import LinkCard from '../components/link-card';
import Error from '../components/error'; 
import CreateLink from '../components/create-link';

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { user } = UrlState();
  const { loading, error, data: urls, fn: fnUrls } = useFetch(getUrls, user.id);
  const { loading: loadingClicks, error: errorClicks, data: clicks, fn: fnClicks } = useFetch(
    getClicksForUrls, 
    urls?.map((url) => url.id)
  );

  useEffect(() => {
    fnUrls();
  }, []);

  useEffect(() => {
    if (urls?.length) {
      fnClicks();
    }
  }, [urls]);

  const filteredUrls = urls?.filter((url) =>
    url.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log('URLs:', urls);
  console.log('Clicks:', clicks);

  const totalClicks = clicks ? clicks.reduce((total, click) => total + (click.count || 1), 0) : 0;

  return (
    <div className='flex flex-col gap-8'>
      {(loading || loadingClicks) && (
        <BarLoader width={"100%"} color="#36d7b7" />
      )}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Links Created</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{urls ? urls.length : 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{totalClicks}</p> {/* Total clicks */}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <h1 className="text-4xl font-extrabold">My Links</h1>
        <CreateLink />
      </div>

      <div className='relative'>
        <Input
          type="text"
          placeholder="Filter Links..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Filter className="absolute top-2 right-2 p-1" />
      </div>

      {error && <Error message={error.message || "An error occurred."} />}
      {errorClicks && <Error message={errorClicks.message || "An error occurred fetching clicks."} />}

      {(filteredUrls || []).map((url, i) => (
        <LinkCard key={i} url={url} fetchUrls={fnUrls} />
      ))}
    </div>
  );
};

export default Dashboard;
