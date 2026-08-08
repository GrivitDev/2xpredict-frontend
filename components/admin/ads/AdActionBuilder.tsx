'use client';


import {
  useState,
} from 'react';



import {
  Input,
} from '@/components/ui/input';



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
  AdAction,
} from '@/types/ad';



import {
  AdPage,
} from '@/constants/ads/ad-page';



import {
  AD_ROUTES,
} from '@/constants/ads/ad-routes';







interface Props {

  value:AdAction[];

  onChange:(value:AdAction[])=>void;

}







export function AdActionBuilder({

  value,

  onChange,

}:Props){





  const [label,setLabel] =
    useState('');



  const [url,setUrl] =
    useState('');



  const [selectedPage,setSelectedPage] =
    useState<AdPage>();








  function handlePageSelect(
    page:AdPage,
  ){


    setSelectedPage(page);



    setUrl(
      AD_ROUTES[page],
    );


  }










  function addAction(){



    if(
      !label.trim() ||
      !url.trim()
    ){

      return;

    }






    onChange([

      ...value,

      {

        label:label.trim(),

        url:url.trim(),

      },


    ]);







    setLabel('');

    setUrl('');

    setSelectedPage(undefined);



  }









  function removeAction(
    index:number,
  ){


    onChange(

      value.filter(
        (_,i)=>i !== index,
      )

    );


  }









  return (

    <div className="space-y-4">





      <Label>
        Actions
      </Label>







      <div
        className="
          grid
          gap-3
          md:grid-cols-3
        "
      >





        <Input


          value={label}


          onChange={(e)=>
            setLabel(
              e.target.value,
            )
          }


          placeholder="Button label"


        />









        <Select


          value={selectedPage}


          onValueChange={(value)=>

            handlePageSelect(
              value as AdPage,
            )

          }


        >


          <SelectTrigger>


            <SelectValue

              placeholder="Select internal page"

            />


          </SelectTrigger>






          <SelectContent>



            {
              Object.values(AdPage).map(
                (page)=>(

                  <SelectItem

                    key={page}

                    value={page}

                  >

                    {page}

                  </SelectItem>


                )
              )
            }



          </SelectContent>




        </Select>









        <Input


          value={url}


          onChange={(e)=>

            setUrl(
              e.target.value,
            )

          }


          placeholder="/payments or https://example.com"


        />





      </div>









      <Button


        type="button"


        onClick={addAction}


      >

        Add Action


      </Button>









      <div className="space-y-2">



        {
          value.map(

            (action,index)=>(


              <div


                key={index}


                className="
                  flex
                  items-center
                  justify-between
                  rounded-md
                  border
                  p-3
                "


              >





                <div>


                  <p>

                    {action.label}

                  </p>




                  <p
                    className="
                      text-sm
                      opacity-70
                    "
                  >

                    {action.url}

                  </p>




                </div>









                <Button


                  type="button"


                  variant="destructive"


                  size="sm"


                  onClick={()=>

                    removeAction(index)

                  }


                >


                  Remove


                </Button>





              </div>



            )

          )
        }





      </div>





    </div>


  );

}