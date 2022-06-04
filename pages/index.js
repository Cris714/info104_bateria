import { Link } from "@chakra-ui/react";
import NextLink from "next/link"
import {useCookies} from 'react-cookie' 


const onClickMobile = () => {
  const [cookies, setCookie] = useCookies(['configs']);
  setCookie('configs', {hmax: '100px', wmax: '10px'}, { path: '/' });
}

const onClickDesktop = () => {
  const [cookies, setCookie] = useCookies(['configs']);
  setCookie('configs', {hmax: '100px', wmax: '10px'}, { path: '/' });
}



export default function Index() {
  return (
    <div>
      <NextLink href='/page2' passHref>
        <Link className="mobileLink" fontSize='20px' onClick={onClickMobile}>Horario (formato movil)</Link>
      </NextLink>
      <NextLink href='/page2' passHref>
        <Link className="desktopLink" fontSize='20px' onClick={onClickDesktop}>Horario (formato desktop)</Link>
      </NextLink>
    </div>
  );
}