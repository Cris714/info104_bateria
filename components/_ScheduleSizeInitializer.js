import {useEffect} from "react";

const _ScheduleSizeInitializer = ({configs, autoReloadFunc}) => {
  const setScheduleSize = () => {
    if(window.innerHeight < 600 || window.innerWidth < 600){
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