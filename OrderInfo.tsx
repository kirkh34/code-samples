/* A component in the production software - this is the component I use a custom hook to grab the data */
import React from 'react';
import { OrderPDF } from './OrderPDF';
import { useOrderData } from './hooks';

import Grid from '@mui/material/Unstable_Grid2';
import OrderLeftColumn from './OrderLeftColumn';

export function OrderInfo(props: any) {
  const { id } = props;

  const { data, isLoading, error } = useOrderData(
    id,
    { subscribe: true, idField: 'id', includeMetadataChanges: true },
    { staleTime: 0, refetchOnWindowFocus: true }
  );

  if (isLoading) return <>Loading</>;

  if (error) return <>{'An error has occurred: ' + error}</>;

  if (!data) return <>No data</>;

  return (
    <>
      <Grid container flexGrow={1} justifyContent='center'>
        <Grid lg={12} xl={5} sx={{ mr: 0, width: '100%' }}>
          {/* Inner Grid Begin */}
          <OrderLeftColumn id={id} data={data} />
          {/* Inner Grid End */}
        </Grid>
        <Grid lg={12} xl={7} sx={{ mt: 1, width: '100%' }}>
          <OrderPDF id={id} data={data} />
        </Grid>
      </Grid>
    </>
  );
}
