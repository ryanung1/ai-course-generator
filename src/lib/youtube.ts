import axios from "axios";
import { YoutubeTranscript } from 'youtube-transcript'
import { new_output, question_output, strict_output } from "./gpt";


export async function searchYoutube(searchQuery: string) {
    try {
        // console.log("searchQuery: ", searchQuery)
        searchQuery = encodeURIComponent(searchQuery);
        const { data } = await axios.get(
          `https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_API_KEY}&q=${searchQuery}&videoDuration=medium&videoEmbeddable=true&type=video&maxResults=5`
        );
        // console.log("videoID: ", data.items[0].id.videoId)
        if(!data) {
          console.log("Youtube failed")
          throw new Error("Something went wrong")
        }
        if(data.items[0] == undefined) {
          console.log("Youtube failed")
          throw new Error("Something went wrong")
        }
        return data.items[0].id.videoId
    } catch (error) {
        console.log(error)
    }
}

export async function getTranscript(videoId:string) {
    try {
        let transcript_arr = await YoutubeTranscript.fetchTranscript(videoId, {
            lang:'en',
            country:'EN',
        })
        let transcript = ''
        for(let t of transcript_arr) {
            transcript += t.text + ' '
        }
        return transcript.replaceAll('\n', "")
    } catch (error) {
        return ""
    }
}

export async function getQuestionsFromTranscript(transcript: string, course_title: string) {
    // type Question = {
    //     question: string,
    //     answer: string,
    //     option1: string,
    //     option2: string,
    //     option3: string,
    // }

    // const questions: Question[] = await new_output(
    //     'You are a helpful AI that is able to generate MCQ questions and answers, the length of each answer should not be more than 15 words and questions should not be repeated. You must output JSON.',
    //     new Array(5).fill(
    //         `You are to generate a random hard mcq question about ${course_title} with context of the following transcript ${transcript}. Do not repeat or generate the same question as pereviously generated questions. Generate different questions.`
    //     ),
        
    //     {
    //         question: 'question',
    //         answer:'answer with max length of 15 words',
    //         option1: 'option1 with max length of 15 words',
    //         option2: 'option2 with max length of 15 words',
    //         option3: 'option3 with max length of 15 words'
    //     }
    // )

    type QuestionArray = Array<{
        question: string,
        answer: string,
        option1: string,
        option2: string,
        option3: string,
      }>;

    const questions: QuestionArray = await question_output(
        'You are a helpful AI that is able to generate MCQ questions and answers, the length of each answer should not be more than 15 words and questions should not be repeated. You must output JSON.',

            `You are to generate 3-5 random hard mcq questions about ${course_title} with context of the following transcript ${transcript}. Do not repeat or generate the same question as pereviously generated questions. Generate different questions. Make sure each option is different to the answer option. You must output JSON in an array with each JSON representing one questions along with the answer and the other options.`
        ,
        [
            {
                question: 'question',
                answer:'answer with max length of 15 words',
                option1: 'option1 with max length of 15 words',
                option2: 'option2 with max length of 15 words',
                option3: 'option3 with max length of 15 words'
            },
            {
                question: 'question',
                answer:'answer with max length of 15 words',
                option1: 'option1 with max length of 15 words',
                option2: 'option2 with max length of 15 words',
                option3: 'option3 with max length of 15 words'
            },
            {
                question: 'question',
                answer:'answer with max length of 15 words',
                option1: 'option1 with max length of 15 words',
                option2: 'option2 with max length of 15 words',
                option3: 'option3 with max length of 15 words'
            },
            {
                question: 'question',
                answer:'answer with max length of 15 words',
                option1: 'option1 with max length of 15 words',
                option2: 'option2 with max length of 15 words',
                option3: 'option3 with max length of 15 words'
            }

        ]
    )

    return questions
}