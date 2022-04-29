import Head from "next/head";
import React from "react";
import {useEffect} from "react";
import {Box} from "@chakra-ui/react";
import {VStack} from "@chakra-ui/react";
import {
  useRadio,
  useRadioGroup, 
} from "@chakra-ui/react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react"



function RadioCard(props) {
  const { getInputProps, getCheckboxProps } = useRadio(props)

  const input = getInputProps()
  const checkbox = getCheckboxProps()

  return (
    <Box as='label'>
      <input {...input} />
      <Box
        {...checkbox}
        cursor='pointer'
        borderWidth='1px'
        borderRadius='md'
        boxShadow='md'
        _checked={{
          bg: 'teal.600',
          color: 'white',
          borderColor: 'teal.600',
        }}
        _focus={{
          boxShadow: 'outline',
        }}
        px={5}
        py={3}
      >
        {props.children}
      </Box>
    </Box>
  )
}



export async function getServerSideProps(context) {
  const res = await fetch("http://localhost:3000/data/asignaturas.json");
  const data = await res.json();

  if (!data) {
    return {
      notFound: true,
    };
  }

  return {
    props: { data },
  };
}



const Index = ({ data }) => {
  const zip = (a, b) => a.map((k, i) => [k, b[i]]);
  useEffect(() => {
    data.map((item, index) => {
      console.log(item.id);
      if (localStorage.getItem(item.id) === null) {
        localStorage.setItem(item.id, JSON.stringify(item.done));
      }
      //localStorage.setItem(item.id + "__object", JSON.stringify(item));
    });
  }, []);

  const options = [
    'Grupo 01 - Juan Pablo Concha',
    'Grupo 02 - Juan Pablo Concha',
    'Grupo 03 - Felipe Tauler',
    'Grupo 04 - Felipe Tauler',
    'Grupo 05 - Javier Arriaza',
    'Grupo 06 - Javier Arriaza',
  ]

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'framework',
    defaultValue: 'react',
    onChange: console.log,
  })
  const group = getRootProps()

  return (
    <div className="container">
      <Head>
        <title>Horario Bateria</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>
          Asignaturas
        </h1>
        <Box bg="#12345600" borderWidth='4px' overflow='scroll' maxH='450px'>
          <Accordion>
            {data.map((item, index) => (
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex='1' textAlign='left'>
                      {item.code} - {item.title}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <VStack {...group} align='stretch'>
                    {item.grupos.map((value, index) => {
                      const radio = getRadioProps({ value })
                      return (
                        <RadioCard key={value} {...radio}>
                          {value} - {item.profesores[index]}
                        </RadioCard>
                      )
                    })}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            ))}

          </Accordion>
        </Box>
        
      </main>

    </div>
  );
};

export default Index;
