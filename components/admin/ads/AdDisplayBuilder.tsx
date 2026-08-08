'use client';

import {
  Plus,
  Trash2,
} from 'lucide-react';


import {
  Button,
} from '@/components/ui/button';


import {
  Label,
} from '@/components/ui/label';


import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';


import {
  Switch,
} from '@/components/ui/switch';


import {
  Input,
} from '@/components/ui/input';


import { AdPage } from '@/constants/ads/ad-page';
import { AdDevice } from '@/constants/ads/ad-device';
import { AdPosition } from '@/constants/ads/ad-position';
import { AdTrigger } from '@/constants/ads/ad-trigger';
import { AdDisplay, } from '@/types/ad';


interface AdDisplayBuilderProps {

  value:AdDisplay[];

  onChange:(value:AdDisplay[])=>void;

}



const pages = Object.values(AdPage);

const devices = Object.values(AdDevice);

const positions = Object.values(AdPosition);

const triggers = Object.values(AdTrigger);





export function AdDisplayBuilder({

  value,

  onChange,

}:AdDisplayBuilderProps){



  function addDisplay(){


    onChange([

      ...value,

      {

        page:AdPage.HOME,

        position:AdPosition.HERO,

        device:AdDevice.ALL,

        trigger:AdTrigger.ALWAYS,

        fixed:false,

        displayOrder:value.length + 1,

      },


    ]);


  }





  function updateDisplay(
    index:number,
    key:string,
    val:any,
  ){


    const updated = [...value];


    updated[index] = {

      ...updated[index],

      [key]:val,

    };


    onChange(updated);


  }





  function removeDisplay(index:number){


    onChange(

      value.filter(
        (_,i)=>i!==index
      )

    );


  }





  return (

    <div className="space-y-5">


      <div className="flex items-center justify-between">


        <div>

          <h3 className="font-semibold">
            Display Rules
          </h3>


          <p className="text-sm text-muted-foreground">

            Choose where this advertisement appears.

          </p>


        </div>




        <Button

          type="button"

          variant="outline"

          size="sm"

          onClick={addDisplay}

        >

          <Plus className="mr-2 size-4"/>

          Add Placement

        </Button>


      </div>






      {
        value.map(
          (display,index)=>(


            <div

              key={index}

              className="
                space-y-4
                rounded-xl
                border
                p-4
              "

            >



              <div className="flex items-center justify-between">


                <h4 className="font-medium">

                  Placement {index + 1}

                </h4>



                <Button

                  type="button"

                  variant="ghost"

                  size="icon"

                  onClick={()=>removeDisplay(index)}

                >

                  <Trash2 className="size-4"/>

                </Button>


              </div>






              <div className="grid gap-4 md:grid-cols-2">



                <div>

                  <Label>
                    Page
                  </Label>


                  <Select

                    value={display.page}

                    onValueChange={(value)=>
                      updateDisplay(
                        index,
                        'page',
                        value
                      )
                    }

                  >

                    <SelectTrigger>

                      <SelectValue/>

                    </SelectTrigger>


                    <SelectContent>


                      {
                        pages.map(page=>(

                          <SelectItem

                            key={page}

                            value={page}

                          >

                            {page}

                          </SelectItem>

                        ))
                      }


                    </SelectContent>


                  </Select>


                </div>






                <div>

                  <Label>
                    Position
                  </Label>


                  <Select

                    value={display.position}

                    onValueChange={(value)=>
                      updateDisplay(
                        index,
                        'position',
                        value
                      )
                    }

                  >

                    <SelectTrigger>

                      <SelectValue/>

                    </SelectTrigger>


                    <SelectContent>


                      {
                        positions.map(position=>(

                          <SelectItem

                            key={position}

                            value={position}

                          >

                            {position}

                          </SelectItem>

                        ))
                      }


                    </SelectContent>


                  </Select>


                </div>







                <div>

                  <Label>
                    Device
                  </Label>


                  <Select

                    value={display.device}

                    onValueChange={(value)=>
                      updateDisplay(
                        index,
                        'device',
                        value
                      )
                    }

                  >

                    <SelectTrigger>

                      <SelectValue/>

                    </SelectTrigger>


                    <SelectContent>


                      {
                        devices.map(device=>(

                          <SelectItem

                            key={device}

                            value={device}

                          >

                            {device}

                          </SelectItem>

                        ))
                      }


                    </SelectContent>


                  </Select>


                </div>






                <div>

                  <Label>
                    Trigger
                  </Label>


                  <Select

                    value={display.trigger}

                    onValueChange={(value)=>
                      updateDisplay(
                        index,
                        'trigger',
                        value
                      )
                    }

                  >

                    <SelectTrigger>

                      <SelectValue/>

                    </SelectTrigger>


                    <SelectContent>


                      {
                        triggers.map(trigger=>(

                          <SelectItem

                            key={trigger}

                            value={trigger}

                          >

                            {trigger}

                          </SelectItem>

                        ))
                      }


                    </SelectContent>


                  </Select>


                </div>



              </div>






              <div className="grid gap-4 md:grid-cols-2">



                <div>

                  <Label>
                    Display Order
                  </Label>


                  <Input

                    type="number"

                    value={display.displayOrder}

                    onChange={(e)=>
                      updateDisplay(
                        index,
                        'displayOrder',
                        Number(e.target.value)
                      )
                    }

                  />

                </div>






                <div className="flex items-center justify-between pt-7">


                  <Label>
                    Fixed Position
                  </Label>


                  <Switch

                    checked={display.fixed}

                    onCheckedChange={(checked)=>
                      updateDisplay(
                        index,
                        'fixed',
                        checked
                      )
                    }

                  />


                </div>


              </div>





            </div>


          )
        )
      }




    </div>

  );

}