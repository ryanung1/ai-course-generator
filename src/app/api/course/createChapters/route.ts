import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { strict_output, new_output } from "@/lib/gpt";
import { checkSubscription } from "@/lib/subscription";
import { getUnsplashImage } from "@/lib/unsplash";
import { createChaptersSchema } from "@/validators/course";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(req: Request, res: Response) {
  // const session = await getAuthSession()
  // const userId = session?.user.id as string
  try {
    const session = await getAuthSession()
    if(!session?.user) {
      return new NextResponse('unauthorised', { status: 401 })
    }
    const isPro = await checkSubscription()
    if(session.user.credits <= 0 && !isPro) {
      return new NextResponse('No Credits', {status: 402})
    }
    const userId = session?.user.id as string
    const body = await req.json();
    const { title, units } = createChaptersSchema.parse(body);
    console.log(title)
    console.log(units)

    type outputUnits = {
      title: string;
      chapters: {
        youtube_search_query: string;
        chapter_title: string;
      }[];
    }[];

    let user_prompts = []
    for (let i=0; i<units.length; i++) {
      let prompt = `It is your job to create a course about ${title}. The user has requested to create chapters for each of the units. \n' +
          Then, for each chapter, provide a detailed youtube search query that can be used to find an informative educational video for each chapter. \n' +
          Each query should give an educational informative course in youtube.\n' +
          Generate chapters for a unit titled "${units[i]}" for a course about "${title}"`
          user_prompts.push(prompt)
    }
    let gpt_output: outputUnits = await new_output(
      "You are an AI capable of curating course content, coming up with relevant chapter titles, and finding relevant youtube videos for each chapter. You are to output JSON.",
      user_prompts
      ,
      {
        title: "title of the unit",
        chapters:
          "an array of chapters, each chapter should have a youtube_search_query and a chapter_title key in the JSON object",
      }
    );


    // let output_units = [{"title": "", "chapters": [{"youtube_search_query": "", "chapter_title": ""}]},{"title": "", "chapters": [{"youtube_search_query": "", "chapter_title": ""}]}]

    const imageSearchTerm = await new_output(
      "You are an AI capable of finding the most relevant image for a course. You are to output JSON.",
      `Please provide a good image search term for the title of a course about ${title}. This search term will be fed into the Unsplash API so make sure it is a good search term that will return good results.`,
      {
        image_search_term: "a good search term for the title of the course",
      }
    );

    const course_image = await getUnsplashImage(
      imageSearchTerm.image_search_term
    );

    const course = await prisma.course.create({
      data: {
        name: title,
        image: course_image,
        // userId: userId,
      },
    });

    for (const unit of gpt_output) {
      const title = unit.title;
      const prismaUnit = await prisma.unit.create({
        data: {
          name: title,
          courseId: course.id,
        },
      });
      await prisma.chapter.createMany({
        data: unit.chapters.map((chapter) => {
          return {
            name: chapter.chapter_title,
            youtubeSearchQuery: chapter.youtube_search_query,
            unitId: prismaUnit.id,
          };
        }),
      });
    }
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data:{
        credits: {
          decrement: 1
        }
      }
    })
    return NextResponse.json({ course_id: course.id, userId: userId });


  } catch (error) {
    if (error instanceof ZodError) {
      return new NextResponse("invalid body", { status: 400 });
    }
    return new NextResponse("Internal Server Error", {status: 500})
  }
}
