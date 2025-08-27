import { ref, onMounted, onUnmounted } from 'vue';
import { LoremIpsum } from 'lorem-ipsum';

export interface MessagePart {
  tag?: string;
  text: string;
}

export type MessageParts = MessagePart[];

export function useFakeMessages(speed = 1) {
  const messages = ref<MessageParts[]>([]);
  const lorem = new LoremIpsum();
  let timer: ReturnType<typeof setTimeout>;
  let wordCount = 0;

  const getRandomInt = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const getInterval = () => getRandomInt(2 * (1 - speed), 120 * (1 - speed));
  const getWordCount = () => getRandomInt(10, 150);
  const getWords = () => Math.round(50 * speed);

  const update = () => {
    if (wordCount <= 0) {
      wordCount = getWordCount();
      messages.value.push([]);
    }

    const tag = Math.random() < 0.1 ? 'h1' : undefined;

    let words = getWords();
    if (words > wordCount) {
      words = wordCount;
    }

    const text = lorem.generateWords(words);
    messages.value[messages.value.length - 1].push({ tag, text });

    wordCount -= words;
    timer = setTimeout(update, getInterval());
  };

  onMounted(() => {
    timer = setTimeout(update, getInterval());
  });

  onUnmounted(() => clearTimeout(timer));

  return messages;
}
