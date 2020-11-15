// initial object state
export const initialState = {
    user: null
}

export const getBasketTotal = (basket) =>
    //for every item, reduce() will map to the item's price and add to the total amount where initial amount is 0
    basket?.reduce((amount, item) => item.price + amount, 0)

const reducer = (state, action) => {

    console.log(action);
    switch (action.type) {

        //action type
        case 'SET_USER':

            return {
                ...state, //previous state
                user: action.user //state with changes
            }

        default:
            return state;
    }
}

export default reducer;