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
  Save,
  X,
  Loader2,
  Newspaper,
} from 'lucide-react';

import toast from 'react-hot-toast';

import api from '@/lib/axios';

type Article = {
  _id: string;
  title: string;
  content: string;
  status: string;
};

export default function ArticlesPage() {
  const queryClient = useQueryClient();

  const {
    data: articles = [],
    isLoading,
  } = useQuery<Article[]>({
    queryKey: ['articles'],
    queryFn: async () => {
      const response = await api.get('/articles');

      return response.data;
    },
  });

  const [
    editArticle,
    setEditArticle,
  ] = useState<Article | null>(null);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const updateField = <K extends keyof Article>(
    field: K,
    value: Article[K],
  ) => {
    setEditArticle((previous) =>
      previous
        ? {
            ...previous,
            [field]: value,
          }
        : null,
    );
  };

  const saveArticle = async () => {
    if (!editArticle) {
      return;
    }

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

      await queryClient.invalidateQueries({
        queryKey: ['articles'],
      });
    } catch {
      toast.error(
        'Failed to update article',
      );
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div
          className="
            h-10
            w-56
            animate-pulse
            rounded-xl
            bg-muted
          "
        />

        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
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
    <div className="space-y-6">
      {/* HEADER */}

      <div
        className="
          flex
          flex-col
          gap-4
          md:flex-row
          md:items-center
          md:justify-between
        "
      >
        <div>
          <div
            className="
              mb-3
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              bg-primary/10
              px-3
              py-1.5
              text-xs
              font-medium
              text-primary
            "
          >
            <Newspaper className="h-4 w-4" />

            Editorial Control
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            Manage Articles
          </h1>

          <p className="mt-1 text-s text-muted-foreground">
            Review, edit and manage published football
            content.
          </p>
        </div>

        <div
          className="
            w-fit
            rounded-2xl
            border
            bg-card/70
            px-5
            py-3
            backdrop-blur
          "
        >
          <p className="text-xs text-muted-foreground">
            Total Articles
          </p>

          <p className="mt-0.5 text-xl font-bold">
            {articles.length}
          </p>
        </div>
      </div>

      {/* ARTICLE LIST */}

      <div className="grid gap-4">
        {articles.length === 0 && (
          <div
            className="
              flex
              min-h-[220px]
              flex-col
              items-center
              justify-center
              rounded-2xl
              border
              border-dashed
              p-6
              text-center
            "
          >
            <FileText className="h-10 w-10 text-muted-foreground" />

            <p className="mt-4 font-semibold">
              No articles yet
            </p>

            <p className="mt-1 text-s text-muted-foreground">
              Published and draft articles will appear here.
            </p>
          </div>
        )}

        {articles.map((article) => (
          <article
            key={article._id}
            className="
              group
              rounded-2xl
              border
              bg-card/70
              p-4
              backdrop-blur-xl
              transition
              hover:-translate-y-0.5
              hover:shadow-lg
              sm:p-5
            "
          >
            <div
              className="
                flex
                flex-col
                gap-4
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div className="flex min-w-0 items-start gap-3">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-primary/10
                    text-primary
                  "
                >
                  <FileText className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h3 className="truncate font-semibold">
                    {article.title}
                  </h3>

                  <div className="mt-2">
                    {article.status === 'published' ? (
                      <span
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-full
                          bg-emerald-500/10
                          px-2.5
                          py-1
                          text-xs
                          font-medium
                          text-emerald-600
                        "
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />

                        Published
                      </span>
                    ) : (
                      <span
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-full
                          bg-amber-500/10
                          px-2.5
                          py-1
                          text-xs
                          font-medium
                          text-amber-600
                        "
                      >
                        <Clock3 className="h-3.5 w-3.5" />

                        Draft
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditArticle(article)}
                className="
                  inline-flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-primary
                  px-4
                  py-2.5
                  text-s
                  font-semibold
                  text-primary-foreground
                  transition
                  hover:opacity-90
                  sm:w-auto
                "
              >
                <Edit3 className="h-4 w-4" />

                Edit
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* EDIT MODAL */}

      {editArticle && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/60
            p-3
            backdrop-blur-sm
            sm:p-6
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-article-title"
        >
          <div
            className="
              flex
              max-h-[92vh]
              w-full
              max-w-3xl
              flex-col
              overflow-hidden
              rounded-3xl
              border
              bg-card
              shadow-2xl
            "
          >
            {/* MODAL HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                border-b
                px-5
                py-4
                sm:px-6
              "
            >
              <div>
                <h2
                  id="edit-article-title"
                  className="font-bold"
                >
                  Edit Article
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  Update the article content.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditArticle(null)}
                disabled={saving}
                aria-label="Close editor"
                className="
                  rounded-xl
                  p-2
                  text-muted-foreground
                  transition
                  hover:bg-muted
                  hover:text-foreground
                "
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* MODAL CONTENT */}

            <div
              className="
                overflow-y-auto
                p-5
                sm:p-6
              "
            >
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="article-title"
                    className="
                      mb-2
                      block
                      text-xs
                      font-semibold
                      text-muted-foreground
                    "
                  >
                    Title
                  </label>

                  <input
                    id="article-title"
                    value={editArticle.title}
                    onChange={(event) =>
                      updateField(
                        'title',
                        event.target.value,
                      )
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      bg-background
                      px-4
                      py-3
                      text-s
                      outline-none
                      transition
                      focus:border-primary
                      focus:ring-2
                      focus:ring-primary/10
                    "
                  />
                </div>

                <div>
                  <label
                    htmlFor="article-content"
                    className="
                      mb-2
                      block
                      text-xs
                      font-semibold
                      text-muted-foreground
                    "
                  >
                    Content
                  </label>

                  <textarea
                    id="article-content"
                    value={editArticle.content}
                    onChange={(event) =>
                      updateField(
                        'content',
                        event.target.value,
                      )
                    }
                    className="
                      min-h-72
                      w-full
                      resize-y
                      rounded-xl
                      border
                      bg-background
                      p-4
                      text-s
                      leading-6
                      outline-none
                      transition
                      focus:border-primary
                      focus:ring-2
                      focus:ring-primary/10
                    "
                  />
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}

            <div
              className="
                flex
                flex-col-reverse
                gap-3
                border-t
                p-5
                sm:flex-row
                sm:p-6
              "
            >
              <button
                type="button"
                onClick={() => setEditArticle(null)}
                disabled={saving}
                className="
                  flex
                  flex-1
                  items-center
                  justify-center
                  rounded-xl
                  bg-muted
                  px-4
                  py-3
                  text-s
                  font-semibold
                  transition
                  hover:bg-muted/80
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveArticle}
                disabled={saving}
                className="
                  flex
                  flex-1
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-primary
                  px-4
                  py-3
                  text-s
                  font-semibold
                  text-primary-foreground
                  transition
                  hover:opacity-90
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}

                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}