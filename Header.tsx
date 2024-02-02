/* This is a component from an in-house production software system */
import { Button, Chip, Paper, Stack, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { PriorityMenu } from '../PriorityMenu';
import { StatusChip } from '../StatusChip';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useAddPinnedNav, usePinnedNav } from '../dashboard/hooks';

export function OrderHeader(props: any) {
  const { id, data } = props;

  const [pinned, setPinned] = useState(false);
  const seeIfPinned: any = (data: any) => {
    data?.map((order: any) => {
      return id == order.lwo;
    });
  };

  const { data: pinnedData } = usePinnedNav({
    //refetchOnMount: false,
    staleTime: Infinity,
    cacheTime: Infinity,
    onSuccess: () => {
      const isTrue: boolean = seeIfPinned(pinnedData);
      setPinned(isTrue);
    },
  });
  const { mutate: addPinned } = useAddPinnedNav();

  useEffect(() => {
    pinnedData?.map((order: any) => {
      if (id == order.lwo) setPinned(true);
    });
  }, [id, pinnedData, pinned]);

  const pinOrder = () => {
    addPinned({
      lwo: data.bsn_data.lwo,
      so: data.bsn_data.so,
      group: data.bsn_data.group,
      customer: data.bsn_data.customer,
    });
    setPinned(true);
  };
  return (
    <>
      {' '}
      <Stack
        component={Paper}
        spacing={2}
        direction='row'
        alignItems='center'
        justifyContent='space-around'
        sx={{ p: 1, mr: 1 }}
      >
        <Stack spacing={1} direction='row' alignItems='center'>
          <Typography variant='h6' color='primary'>
            Priority:
          </Typography>
          <PriorityMenu
            priority={!data.priority ? 'Low' : data.priority}
            id={id}
          />
        </Stack>

        <Stack spacing={1} direction='row' alignItems='center'>
          <Typography variant='h6' color='primary'>
            Status:
          </Typography>
          <StatusChip
            status={!data?.status ? data?.bsn_data?.art_status : data?.status}
          />
        </Stack>
        {pinned ? (
          <Chip
            label='Order Pinned'
            variant='outlined'
            color='primary'
            size='small'
          />
        ) : (
          <Button
            variant='contained'
            size='small'
            startIcon={<AttachFileIcon />}
            onClick={() => {
              pinOrder();
            }}
          >
            Pin Order
          </Button>
        )}
      </Stack>
    </>
  );
}
