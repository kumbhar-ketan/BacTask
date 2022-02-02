const initialState = {
  data: [],
  currentPage: 0,
  nbPages: null
};

function reducer(state = initialState, action) {
  switch(action.type) {
    case 'SET_LIST_DATA':
      return {
        ...state,
        data: action.payload.page === 1 ? action?.payload?.hits : [...state.data, ...action?.payload?.hits],
        currentPage: action.payload.page,
        nbPages: action.payload.page
      };
    default:
      return state;
  }
}

export default reducer;