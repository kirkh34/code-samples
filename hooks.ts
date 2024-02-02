/* Here is a hooks file for the production software */
//import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { callAdminFunction } from '../../data/firebase-functions';
import { firestore } from '../../data/firebase-config';
import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { Order } from './orderData.generated';
import {
  useFirestoreDocumentData,
  useFirestoreDocumentMutation,
  useFirestoreQuery,
  useFirestoreQueryData,
} from '@react-query-firebase/firestore';
import { useMutation, useQueryClient } from 'react-query';
import { getKeyByValue, getPriority } from '../../utils/helpers';
import { statuses } from '../../data/constants';
import { DateTime } from 'luxon';

export type QueryOptions = Record<string, unknown>;

export const useCancelQueries = async () => {
  const queryClient = useQueryClient();
  await queryClient.cancelQueries();
};

export const useOrdersData = (firestoreOpts?: any, queryOpts?: any) => {
  const ordersRef = collection(firestore, 'orders');

  const queryInfo = useFirestoreQueryData(
    ['orders'],
    query(ordersRef),
    { ...firestoreOpts },
    {}
  );
  return {
    ...queryInfo,
    data: queryInfo.data?.map((data: any) => {
      if (!data?.status) data.status = data?.bsn_data?.art_status;
      if (!data?.deco_types) data.deco_types = data?.deco_info?.decoTypes;
      // if (data?.bsn_data?.scheduled_ship_date)
      // data.production_due_date = data?.deco_info?.decoTypes;

      const priority = getPriority(
        data?.bsn_data?.scheduled_ship_date,
        data?.production_due_date
      );
      data.auto_priority = priority;

      return data;
    }),
  };
};

export const useOrderData = (id: any, firestoreOpts?: any, queryOpts?: any) => {
  const ref = doc(firestore, 'orders', id);
  const queryInfo = useFirestoreDocumentData(
    ['order', id],
    ref,

    { ...firestoreOpts },

    { refetchOnMount: 'always' }
  );
  return { ...queryInfo };
};
export const usePDFData = (
  id: any,
  firestoreOpts?: any,
  queryOpts?: QueryOptions
) => {
  const ref = doc(firestore, 'pdfs', id);
  return useFirestoreDocumentData(['pdfs', id], ref, {
    ...firestoreOpts,
    ...queryOpts,
  });
};

// // Get Orders from Firestore
// const getOrders = async () => {
//   try {
//     const querySnapshot = await getDocs(collection(firestore, 'orders'));
//     const arr = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
//     return arr;
//   } catch (err) {
//     console.log(err);
//   }
// };

// Update Status
const updateStatus = async (payload: any) => {
  const orderRef = doc(firestore, 'orders', payload.id);

  const k: any = getKeyByValue(statuses, payload.status)?.toLowerCase();
  let newStatus = payload.status;
  if (payload.status === statuses.REVOKE_STATUS) {
    const doc = await getDoc(orderRef);
    newStatus = doc?.data()?.bsn_data.art_status;
  }

  await setDoc(
    orderRef,
    {
      status: newStatus,
      status_dates:
        payload.status !== statuses.REVOKE_STATUS
          ? { [k]: DateTime.now().toUTC().toISO() }
          : deleteField(),
    },
    { merge: true }
  );

  return payload;
};

export const useUpdateStatus = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation(updateStatus, {
    // onSuccess: (data) => {
    //   queryClient.setQueryData(['orders'], (oldData: any) => {
    //     const targetObj = oldData.find((obj: Order) => obj.id === data.id);
    //     const updatedObj = Object.assign(targetObj, data);
    //     const allNewData = Object.assign(oldData, updatedObj);
    //     return [...allNewData];
    //   });
    // },
  });
  return mutation;
};

//Update Priority
const updatePriority = async (payload: any) => {
  const orderRef = doc(firestore, 'orders', payload.id);
  await setDoc(orderRef, { priority: payload.priority }, { merge: true });
  return payload;
};

export const useUpdatePriority = () => {
  const queryClient = useQueryClient();
  return useMutation(updatePriority, {
    onSuccess: (data) => {
      queryClient.setQueryData(['orders'], (oldData: any) => {
        const targetObj = oldData.find((obj: Order) => obj.id === data.id);
        const updatedObj = Object.assign(targetObj, data);
        const allNewData = Object.assign(oldData, updatedObj);
        return [...allNewData];
      });
    },
  });
};

//Update Production Due Date
const updateProductionDueDate = async (payload: any) => {
  console.log('paylod', payload);

  const orderRef = doc(firestore, 'orders', payload.id);
  await setDoc(
    orderRef,
    {
      production_due_date:
        payload.production_due_date === 'DELETE'
          ? deleteField()
          : payload.production_due_date,
    },
    { merge: true }
  );
  return payload;
};

export const useUpdateProductionDueDate = () => {
  const queryClient = useQueryClient();
  return useMutation(updateProductionDueDate, {
    onSuccess: (data) => {
      //   queryClient.setQueryData(['orders'], (oldData: any) => {
      //     const targetObj = oldData.find((obj: Order) => obj.id === data.id);
      //     const updatedObj = Object.assign(targetObj, data);
      //     const allNewData = Object.assign(oldData, updatedObj);
      //     return [...allNewData];
      //   });
    },
  });
};

//Update Priority
const updateDecoTypes = async (payload: any) => {
  const orderRef = doc(firestore, 'orders', payload.id);
  await setDoc(
    orderRef,
    { deco_info: { deco_types: payload.deco_types } },
    { merge: true }
  );
  return payload;
};

export const useUpdateDecoTypes = () => {
  return useMutation(updateDecoTypes);
};

//Update Inventory Location
const updateInvLoc = async (payload: any) => {
  //console.log('payload', payload);
  const orderRef = doc(firestore, 'orders', payload.id);
  await setDoc(
    orderRef,
    { inventory_locations: payload.inventory_locations },
    { merge: true }
  );
  return payload;
};

export const useUpdateInvLoc = () => {
  return useMutation(updateInvLoc);
};

//Update Notes
const updateNotes = async (payload: any) => {
  //console.log('paylod', payload);
  const orderRef = doc(firestore, 'orders', payload.id);
  await setDoc(orderRef, { notes: payload.noteArr }, { merge: true });
  return payload;
};

export const useUpdateNotes = () => {
  return useMutation(updateNotes);
};
