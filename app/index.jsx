import {Provider} from 'react-redux'
import {createstore} from 'redux'
import React, {Component} from 'react'
import {Router, Route, IndexRoute, browserHistory} from 'react-router'
import {render} from 'react-dom'
import Nav from  './navBar/nav.jsx'


render(
    <Router history={browserHistory}>
        <Route path="/">
            <IndexRoute component={Nav}/>
        </Route>
    </Router>,

    document.getElementById('app')
);
