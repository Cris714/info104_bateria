import { Link } from "@chakra-ui/react";
import NextLink from "next/link"

export default function Index() {
  return (
    <div>
      <NextLink href='/main' passHref>
        <Link fontSize='20px'>Horario Bateria</Link>
      </NextLink>
    </div>
  );
}