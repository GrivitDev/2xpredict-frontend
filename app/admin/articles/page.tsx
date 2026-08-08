'use client';

import {
  useState,
} from 'react';

import {
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  FileText,
  Edit3,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Save,
  X,
  Loader2,
  Newspaper,
} from 'lucide-react';

import toast from 'react-hot-toast';

import api from '@/lib/axios';



export default function ArticlesPage() {

  const queryClient = useQueryClient();


  const {
    data,
    isLoading,
  } = useQuery({

    queryKey: [
      'articles',
    ],

    queryFn: async()=>{

      const res =
        await api.get('/articles');

      return res.data;

    },

  });




  const [
    editArticle,
    setEditArticle,
  ] = useState<any>(null);



  const [
    saving,
    setSaving,
  ] = useState(false);





  const updateField = (
    field:string,
    value:any,
  ) => {

    setEditArticle(
      (prev:any)=>({
        ...prev,
        [field]:value,
      }),
    );

  };







  const saveArticle = async()=>{

    try {

      setSaving(true);


      await api.patch(
        `/articles/${editArticle._id}`,
        editArticle,
      );


      toast.success(
        'Article updated successfully',
      );


      setEditArticle(null);


      queryClient.invalidateQueries({
        queryKey:[
          'articles',
        ],
      });



    } catch {

      toast.error(
        'Failed to update article',
      );


    } finally {

      setSaving(false);

    }

  };







  if(isLoading){

    return (

      <div className="
        space-y-5
      ">

        <div className="
          h-10
          w-64
          animate-pulse
          rounded-xl
          bg-muted
        "/>


        {[1,2,3].map(item=>(

          <div

            key={item}

            className="
              h-24
              animate-pulse
              rounded-2xl
              bg-muted
            "

          />

        ))}

      </div>

    );

  }







  return (

    <div className="
      relative
      space-y-8
    ">



      {/* Header */}

      <div className="
        flex
        flex-col
        gap-5
        md:flex-row
        md:items-center
        md:justify-between
      ">


        <div>


          <div className="
            mb-4
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            bg-primary/10
            px-4
            py-2
            text-sm
            text-primary
          ">

            <Newspaper className="h-4 w-4"/>

            Editorial Control

          </div>



          <h1 className="
            text-4xl
            font-black
            tracking-tight
          ">
            Manage Articles
          </h1>



          <p className="
            mt-2
            text-muted-foreground
          ">
            Review, edit and manage published football content.
          </p>


        </div>





        <div className="
          rounded-2xl
          border
          bg-card/70
          px-5
          py-4
          backdrop-blur
        ">


          <p className="
            text-sm
            text-muted-foreground
          ">
            Total Articles
          </p>


          <p className="
            text-2xl
            font-bold
          ">
            {data?.length || 0}
          </p>


        </div>


      </div>







      {/* Article List */}

      <div className="
        grid
        gap-5
      ">


        {data?.length === 0 && (

          <div className="
            rounded-3xl
            border
            border-dashed
            p-10
            text-center
          ">

            <FileText className="
              mx-auto
              h-10
              w-10
              text-muted-foreground
            "/>


            <p className="
              mt-4
              font-semibold
            ">
              No articles yet
            </p>


          </div>

        )}






        {data?.map(
          (article:any)=>(

          <div

            key={article._id}

            className="
              group
              rounded-3xl
              border
              bg-card/70
              p-6
              backdrop-blur-xl
              transition
              hover:-translate-y-1
              hover:shadow-xl
            "

          >



            <div className="
              flex
              flex-col
              gap-5
              md:flex-row
              md:items-center
              md:justify-between
            ">




              <div className="
                flex
                items-start
                gap-4
              ">



                <div className="
                  rounded-2xl
                  bg-primary/10
                  p-3
                ">

                  <FileText className="
                    h-6
                    w-6
                    text-primary
                  "/>

                </div>




                <div>


                  <h3 className="
                    text-lg
                    font-semibold
                  ">
                    {article.title}
                  </h3>



                  <div className="
                    mt-2
                    flex
                    items-center
                    gap-3
                  ">


                    {article.status === 'published' ? (

                      <span className="
                        flex
                        items-center
                        gap-1
                        rounded-full
                        bg-green-500/10
                        px-3
                        py-1
                        text-xs
                        text-green-600
                      ">

                        <CheckCircle2 className="h-3 w-3"/>

                        Published

                      </span>


                    ) : (

                      <span className="
                        flex
                        items-center
                        gap-1
                        rounded-full
                        bg-orange-500/10
                        px-3
                        py-1
                        text-xs
                        text-orange-600
                      ">

                        <Clock3 className="h-3 w-3"/>

                        Draft

                      </span>

                    )}


                  </div>


                </div>


              </div>







              <button

                onClick={()=>
                  setEditArticle(article)
                }

                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-primary
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-primary-foreground
                  transition
                  hover:opacity-90
                "

              >

                <Edit3 className="h-4 w-4"/>

                Edit

              </button>


            </div>


          </div>


        ))}


      </div>









      {/* Edit Modal */}

      {editArticle && (

        <div className="
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          bg-black/60
          p-4
          backdrop-blur-sm
        ">


          <div className="
            w-full
            max-w-3xl
            rounded-3xl
            border
            bg-card
            p-6
            shadow-2xl
          ">



            <div className="
              flex
              items-center
              justify-between
            ">


              <h2 className="
                text-2xl
                font-bold
              ">
                Edit Article
              </h2>


              <button
                onClick={()=>
                  setEditArticle(null)
                }
              >

                <X className="h-5 w-5"/>

              </button>


            </div>






            <input

              value={editArticle.title}

              onChange={(e)=>
                updateField(
                  'title',
                  e.target.value,
                )
              }

              className="
                mt-6
                w-full
                rounded-xl
                border
                bg-background
                px-4
                py-3
                outline-none
                focus:border-primary
              "

            />





            <textarea

              value={editArticle.content}

              onChange={(e)=>
                updateField(
                  'content',
                  e.target.value,
                )
              }

              className="
                mt-4
                h-72
                w-full
                resize-none
                rounded-xl
                border
                bg-background
                p-4
                outline-none
                focus:border-primary
              "

            />







            <div className="
              mt-6
              flex
              gap-3
            ">


              <button

                onClick={saveArticle}

                disabled={saving}

                className="
                  flex
                  flex-1
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-green-600
                  py-3
                  font-semibold
                  text-white
                "

              >

                {saving && (
                  <Loader2 className="
                    h-4
                    w-4
                    animate-spin
                  "/>
                )}

                <Save className="h-4 w-4"/>

                Save

              </button>





              <button

                onClick={()=>
                  setEditArticle(null)
                }

                className="
                  flex-1
                  rounded-xl
                  bg-muted
                  py-3
                  font-semibold
                "

              >
                Cancel

              </button>


            </div>


          </div>


        </div>

      )}



    </div>

  );

}