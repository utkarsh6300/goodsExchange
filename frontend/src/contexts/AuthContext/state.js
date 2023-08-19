
  
  const initialState = {
    loggedIn: false,
    error: '',
    success: ''
  };
  //we can combine error and message in one with notification which contains meassage and type to take care of mui notification dynamically
  

  const authReducer = (state, action) => {
    switch (action.type) {
      case 'LOGIN':
        return { ...state, loggedIn: true };
      case 'LOGOUT':
        return { ...state, loggedIn: false };
      case 'SET_ERROR':
        return { ...state, error: action.payload };
      case 'SET_SUCCESS':
        return { ...state, success: action.payload };
      case 'CLEAR_NOTIFICATIONS':
        return { ...state, error: null, success: null };
      default:
        return state;
    }
  }; 
  
  export {  initialState, authReducer };
  