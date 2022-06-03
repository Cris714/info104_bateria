import Head from "next/head";
import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Button,
  IconButton,
  Divider,
  HStack,
  VStack,
  Text,
} from "@chakra-ui/react";

import {AddIcon, CloseIcon} from "@chakra-ui/icons"
import {instanceOf} from 'prop-types'
import {withCookies, Cookies} from 'react-cookie' 

import data from "/public/data/asignaturas_v2.json"



class Main extends React.Component{
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

  constructor(props){
    super(props);
    const {cookies} = props;

    this.courses = data;
    this.selectedCourses = cookies.get('selected') || {};

    this.state = {
      selection: {code: '', num: ''},
    };

    // Ajustes iniciales
    Object.keys(this.courses).map((course) => (this.courses[course]["isVisible"] = true));
    Object.keys(this.selectedCourses).map((course) => (this.courses[course].isVisible = false));

    // Binding
    this.addToSelectedCourses = this.addToSelectedCourses.bind(this);
  }

  handleSelection(code, groupNum){
    if(this.state.selection.code+this.state.selection.num != code+groupNum){
      this.setState({selection: {code: code, num: groupNum}});
    }
    else{
      this.setState({selection: {code: '', num: ''}});
    }
  }

  addToSelectedCourses(){
    if(this.state.selection.code != ''){
      let code = this.state.selection.code;
      let group = this.state.selection.num;

      this.selectedCourses[code] = group;
      this.courses[code].isVisible = false;

      this.setState({selection: {code: '', num: ''}});

      // Guardar en cookies
      const { cookies } = this.props;
      cookies.set('selected', this.selectedCourses, {path: '/'});
    }
  }

  removeCourse(code, groupNum){
    this.courses[code].isVisible = true;
    delete this.selectedCourses[code];
    this.setState({selection: {code: '', num: ''}});

    // Quitar de cookies
    const { cookies } = this.props;
    cookies.set('selected', this.selectedCourses, {path: '/'});
  }

  renderCoursesList(){
    return(
      <VStack bg="#FFFFFFEE" overflow='scroll' height={460} width={500} boxShadow='lg'>
        <Accordion width={480}>
          {Object.entries(this.courses).map(([code, course]) => {
            if(course.isVisible){
              return(
                <AccordionItem>
                  <h2>
                    <AccordionButton>
                      <Box flex='1' textAlign='left'>
                        {code} - {course.title}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <VStack direction='row' align='stretch'>
                      {Object.entries(course.groups).map(([num, group]) => (
                        <Button justifyContent='left'
                                size='sm'
                                onClick={e => this.handleSelection(code, num)}
                                bg={e=>(code+num == this.state.selection.code+this.state.selection.num? '#a3e4d7': '#85c1e900')}
                                >
                          Grupo {num} - {group.prof}
                        </Button>
                        ))}
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              )
            }
        })}
        </Accordion>
      </VStack>
    )
  }

  renderSelectedCoursesList(){
    return(
      <VStack height={250} width={500} overflow='scroll' borderRadius='20' boxShadow='lg' bg="#FFFFFFEE">
        {Object.entries(this.selectedCourses).map(([code, course]) => (
          <HStack spacing={5}>
            <Button width={50} height={6}/>
            <Text width={340}> {code} - {this.courses[code].title} </Text>
            <IconButton bg='#EF181640' icon={<CloseIcon/>} onClick={e => this.removeCourse(code, course)}/>
          </HStack>
        ))}
      </VStack>
    )
  }

  renderSchedule(){
    const renderSelection = () => {
      let code = this.state.selection.code;
      let group = this.state.selection.num;
      if(this.state.selection.code != ''){
        return(
          <Text> {code} - {this.courses[code].title} - {this.courses[code].groups[group].sch}</Text>
        )
      }
    }

    return(
      <VStack>
        {Object.entries(this.selectedCourses).map(([code, group]) => (
          <Text> {code} - {this.courses[code].title} - {this.courses[code].groups[group].sch} </Text>
          ))}
        {renderSelection()}
      </VStack>
    )
  }

  render(){  
    return (
      <div className="container">
        <Head>
          <title>Horario Bateria</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main>
          <VStack width='max'>
            <HStack width={1800} spacing={30}>
              <VStack>

                <Text fontSize={30}>
                  Asignaturas
                </Text>

                {this.renderCoursesList()}

                <Button width={500} onClick={this.addToSelectedCourses} boxShadow='lg'>
                  Seleccionar curso
                </Button>

                <Divider />

                {this.renderSelectedCoursesList()}

              </VStack>
                

              <VStack width={1250}>

                <Text fontSize={30}>
                  Horario
                </Text>

                {this.renderSchedule()}

              </VStack>
            </HStack>
          </VStack>
          
        </main>

      </div>
    );
  }
};

export default withCookies(Main);
