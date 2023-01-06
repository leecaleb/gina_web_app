import { createTransform } from 'redux-persist';

export const SetTransform = createTransform(
  // transform state on its way to being serialized and persisted.
  (inboundState, key) => {
    // convert mySet to an Array.
    console.log('inboundState: ', inboundState)
    return { 
      ...inboundState,
      record_id_for_update: [...inboundState.record_id_for_update],
      records_with_error: [...inboundState.records_with_error],
      // student_id_for_update: [...inboundState.student_id_for_update]
    };
  },
  // transform state being rehydrated
  (outboundState, key) => {
    // convert mySet back to a Set.
    return {
      ...outboundState,
      record_id_for_update: new Set(outboundState.record_id_for_update),
      records_with_error: new Set(outboundState.records_with_error),
      // student_id_for_update: new Set(outboundState.student_id_for_update)
    };
  },
  // define which reducers this transform gets called for.
  { whitelist: ['healthstatus'] }
);

export const SetMessageTransform = createTransform(
  // transform state on its way to being serialized and persisted.
  (inboundState, key) => {
    // convert mySet to an Array.
    return { 
      ...inboundState,
      student_id_for_update: [...inboundState.student_id_for_update]
    };
  },
  // transform state being rehydrated
  (outboundState, key) => {
    // convert mySet back to a Set.
    return {
      ...outboundState,
      student_id_for_update: new Set(outboundState.student_id_for_update)
    };
  },
  // define which reducers this transform gets called for.
  { whitelist: ['message'] }
);

export const SetAppetiteTransform = createTransform(
  // transform state on its way to being serialized and persisted.
  (inboundState, key) => {
    // convert mySet to an Array.
    return { 
      ...inboundState,
      updatedStudents: [...inboundState.updatedStudents]
    };
  },
  // transform state being rehydrated
  (outboundState, key) => {
    // convert mySet back to a Set.
    return {
      ...outboundState,
      updatedStudents: new Set(outboundState.updatedStudents)
    };
  },
  // define which reducers this transform gets called for.
  { whitelist: ['appetite'] }
);

export const SetSleepTransform = createTransform(
  // transform state on its way to being serialized and persisted.
  (inboundState, key) => {
    // convert mySet to an Array.
    return { 
      ...inboundState,
      records: {...inboundState.records, all_id: [...inboundState.records.all_id]},
      newDataForCreate: [...inboundState.newDataForCreate],
      oldDataForEdit: [...inboundState.oldDataForEdit],
      records_with_error: [...inboundState.records_with_error],
    };
  },
  // transform state being rehydrated
  (outboundState, key) => {
    // convert mySet back to a Set.
    return {
      ...outboundState,
      records: {...outboundState.records, all_id: new Set(outboundState.records.all_id)},
      newDataForCreate: new Set(...outboundState.newDataForCreate),
      oldDataForEdit: new Set(...outboundState.oldDataForEdit),
      records_with_error: new Set(...outboundState.records_with_error)
    };
  },
  // define which reducers this transform gets called for.
  { whitelist: ['sleep'] }
);
// export default SetTransform;

