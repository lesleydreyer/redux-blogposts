import jsonPlaceholder from '../apis/jsonPlaceholder';
import _ from 'lodash';

//normally an action creator must return an object so you can't do async/await with an api call to jsonplaceholder
//because babel will transpile it down to something different (if you do acync and then return object witht type and optional payload) that will have a case statement and return the ojbect before the api call is made
//but with redux-thunk(applied with applymiddleware in root index.js store file) you can
//have the action creator return an object OR a function so it can do the async function and then it goes to thunk again and returns the object once the api call is made
export const fetchPosts = () => async dispatch => {
    const response = await jsonPlaceholder.get('/posts');
    dispatch({ type: 'FETCH_POSTS', payload: response.data });
};

/*THIS IS THE SAME AS THE ABOVE - CAN REMOVE STUFF / SHORTEN W/ES2015
export const fetchPosts = () => {
    return async dispatch => {
        const response = await jsonPlaceholder.get('/posts');
        dispatch({
            type: 'FETCH_POSTS',
            payload: response
        });
    };
};*/


//MEMOIZE METHOD
//function that returns a function that calls _fetchUser
//.memoize comes from lodash and allows you to just make one call per user id, without it you get way more calls on the network tab in chrome
//one downside to this method is if you needed to fetch user at another point in the 
//application you would have to create another action creator without the .memoize
/*export const fetchUser = id => dispatch => _fetchUser(id, dispatch);
const _fetchUser = _.memoize(async (id, dispatch) => { //_fe.. to say it's a private function
    const response = await jsonPlaceholder.get(`/users/${id}`);
    dispatch({ type: 'FETCH_USER', payload: response.data });
});*/

export const fetchPostsAndUsers = () => async (dispatch, getState) => {
    await dispatch(fetchPosts());//await because you don't want to get at your list of posts until the action creator fetchposts has been done
    //call action creator fetchPosts manually which will return the inner function from fetchPosts method, then dispatch(above dispatch(fetchPosts)) it all so it shows up in redux thunk, and gets invoked with the dispatch in the async dispatch from fechPosts method 
    const userIds = _.uniq(_.map(getState().posts, 'userId'));
    userIds.forEach(id => dispatch(fetchUser(id)));

    //could also refactor like this with lodash .chain/.value
    /*_.chain(getState().posts)
        .map('userId')
        .uniq()
        .forEach(id => dispatch(fetchUser(id)))
        .value();*/
}

export const fetchUser = id => async dispatch => {
    const response = await jsonPlaceholder.get(`/users/${id}`);
    dispatch({ type: 'FETCH_USER', payload: response.data });
};
