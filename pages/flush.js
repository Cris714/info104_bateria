import React from "react";
import {instanceOf} from 'prop-types'
import {withCookies, Cookies} from 'react-cookie' 
import { Link } from "@chakra-ui/react";
import NextLink from "next/link"

var colorPool = ['#d98880', 
                 '#aab7b8',
                 '#ff8dfa', 
                 '#bb8fce', 
                 '#FF5733', 
                 '#FFC300', 
                 '#DAF7A6', 
                 '#85c1e9', 
                 '#a3e4d7',
                 ]

class Flush extends React.Component{
    static propTypes = {
      cookies: instanceOf(Cookies).isRequired
    };
  
    constructor(props){
      super(props);
      const {cookies} = props;
  
      //FLUSH COOKIES
      
      cookies.set('selected', {}, {path: '/'});
      cookies.set('graph', {'lun':{}, 'mar':{}, 'mie':{}, 'jue':{}, 'vie':{}}, {path: '/'});
      cookies.set('colors', {}, {path: '/'});
      cookies.set('available_colors', [...colorPool], {path: '/'});
      cookies.set('user_defined', {}, {path: '/'});
      cookies.set('id_count', 0, {path: '/'});
    }

    render(){
        return (
            <div>
              <NextLink href='/main' passHref>
                <Link fontSize='20px'>Horario Bateria</Link>
              </NextLink>
            </div>
          );
    }
}

export default withCookies(Flush);