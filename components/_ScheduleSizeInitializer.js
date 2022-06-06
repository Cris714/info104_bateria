import {useEffect} from "react";

const _ScheduleSizeInitializer = ({configs, autoReloadFunc}) => {
  const setScheduleSize = () => {
    if(window.innerHeight < 400 || window.innerWidth < 400){
      configs.hmax = '460px';
      configs.wmax = '150px';
      autoReloadFunc();
    }
  }
  
  useEffect(() => {
    setScheduleSize();
  }, []);

  return(<></>)
}

export default _ScheduleSizeInitializer;