const AuthReducer = (state = {}, action) => {
  switch (action.type) {
    case "LOGOUT":
      return {
        ...state,
        user: null,
      }
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
      }
    default:
      return state
  }
}

export default AuthReducer
