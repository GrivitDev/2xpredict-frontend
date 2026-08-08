'use client';

import {
  useMemo,
  useState,
} from 'react';

import {
  FileText,
  ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Send,
  Loader2,
  Newspaper,
} from 'lucide-react';

import toast from 'react-hot-toast';

import {
  useAuth,
} from '@/providers/auth-provider';

import {
  createArticle,
} from '@/services/article.service';



export default function CreateArticlePage() {

  const { token } = useAuth();


  const [loading, setLoading] =
    useState(false);


  const [formData, setFormData] =
    useState({

      title: '',

      excerpt: '',

      content: '',

      featuredImage: '',

    });





  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement
    >,
  ) => {

    setFormData((prev)=>({

      ...prev,

      [e.target.name]:
        e.target.value,

    }));

  };






  const readiness = useMemo(()=>{

    const missing = [
      formData.title,
      formData.excerpt,
      formData.content,
      formData.featuredImage,
    ]
    .filter(
      (item)=>!item.trim(),
    )
    .length;


    return missing;

  },[
    formData,
  ]);






  const handleSubmit =
    async (
      e: React.FormEvent,
    ) => {

      e.preventDefault();


      if (readiness > 0) {

        toast.error(
          'Please complete all article fields',
        );

        return;

      }



      try {

        setLoading(true);



        await createArticle(
          formData,
          token as string,
        );



        toast.success(
          'Article published successfully',
        );



        setFormData({

          title:'',

          excerpt:'',

          content:'',

          featuredImage:'',

        });



      } catch(error:any) {

        toast.error(
          error?.response?.data?.message ||
          'Failed to create article',
        );


      } finally {

        setLoading(false);

      }

    };







  return (

    <div className="
      relative
      max-w-5xl
      space-y-8
    ">


      {/* Background */}

      <div className="
        pointer-events-none
        absolute
        -top-20
        right-0
        h-64
        w-64
        rounded-full
        bg-primary/10
        blur-3xl
      "/>





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

            Content Studio

          </div>



          <h1 className="
            text-4xl
            font-black
            tracking-tight
          ">
            Create Article
          </h1>



          <p className="
            mt-2
            text-muted-foreground
          ">
            Publish football analysis,
            news and premium insights.
          </p>


        </div>





        {/* Status */}

        <div className="
          rounded-2xl
          border
          bg-card/70
          px-5
          py-4
          backdrop-blur
        ">


          {readiness === 0 ? (

            <div className="
              flex
              items-center
              gap-3
              text-green-600
            ">

              <CheckCircle2 className="h-5 w-5"/>

              Ready To Publish

            </div>


          ) : (

            <div className="
              flex
              items-center
              gap-3
              text-orange-600
            ">

              <AlertTriangle className="h-5 w-5"/>

              {readiness}
              {' '}
              Missing Fields

            </div>

          )}


        </div>


      </div>








      {/* Editor */}

      <form

        onSubmit={handleSubmit}

        className="
          space-y-6
          rounded-3xl
          border
          bg-card/70
          p-6
          backdrop-blur-xl
        "

      >




        <InputField

          icon={<FileText className="h-4 w-4"/>}

          name="title"

          label="Article Title"

          placeholder="
          Example: Premier League Weekend Analysis
          "

          value={formData.title}

          onChange={handleChange}

        />





        <InputField

          icon={<FileText className="h-4 w-4"/>}

          name="excerpt"

          label="Short Summary"

          placeholder="
          A short preview shown on article cards
          "

          value={formData.excerpt}

          onChange={handleChange}

        />







        <InputField

          icon={<ImageIcon className="h-4 w-4"/>}

          name="featuredImage"

          label="Featured Image URL"

          placeholder="
          https://example.com/image.jpg
          "

          value={
            formData.featuredImage
          }

          onChange={handleChange}

        />








        <div className="space-y-3">


          <label className="
            flex
            items-center
            gap-2
            text-sm
            font-medium
          ">

            <FileText className="h-4 w-4 text-primary"/>

            Article Content

          </label>




          <textarea

            name="content"

            value={
              formData.content
            }

            onChange={handleChange}

            placeholder="
            Write your football analysis...
            "

            className="
              min-h-[400px]
              w-full
              resize-none
              rounded-2xl
              border
              bg-background
              p-5
              text-sm
              outline-none
              transition
              focus:border-primary
              focus:ring-4
              focus:ring-primary/10
            "

          />


        </div>







        <button

          type="submit"

          disabled={loading}

          className="
            inline-flex
            items-center
            gap-3
            rounded-xl
            bg-primary
            px-8
            py-4
            font-bold
            text-primary-foreground
            transition
            hover:opacity-90
            disabled:opacity-50
          "

        >

          {loading ? (

            <Loader2 className="
              h-5
              w-5
              animate-spin
            "/>

          ) : (

            <Send className="
              h-5
              w-5
            "/>

          )}



          {loading
            ? 'Publishing...'
            : 'Publish Article'
          }


        </button>


      </form>


    </div>

  );

}







function InputField({
  icon,
  label,
  name,
  placeholder,
  value,
  onChange,
}:{
  icon:React.ReactNode;
  label:string;
  name:string;
  placeholder:string;
  value:string;
  onChange:any;
}) {

  return (

    <div className="space-y-3">


      <label className="
        flex
        items-center
        gap-2
        text-sm
        font-medium
      ">

        {icon}

        {label}

      </label>




      <input

        name={name}

        value={value}

        onChange={onChange}

        placeholder={placeholder}

        className="
          w-full
          rounded-xl
          border
          bg-background
          px-5
          py-3
          text-sm
          outline-none
          transition
          focus:border-primary
          focus:ring-4
          focus:ring-primary/10
        "

      />

    </div>

  );

}