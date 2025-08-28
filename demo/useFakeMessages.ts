import { LoremIpsum } from 'lorem-ipsum';
import { onMounted, onUnmounted, ref } from 'vue';

export interface MessagePart {
  tag?: string;
  text: string;
}

export type MessageParts = MessagePart[];

export function useFakeMessages(speed = 1) {
  const messages = ref<MessageParts[]>([]);
  const lorem = new LoremIpsum();
  let timer: ReturnType<typeof setTimeout> | null = null;
  let wordCount = 0;
  let stopped = false;

  const getRandomInt = (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  const clamp = (v: number, min: number, max: number) =>
    Math.min(max, Math.max(min, v));
  const s = clamp(speed, 0.05, 10); // avoid 0/negative and unbounded spikes
  const getInterval = () =>
    getRandomInt(Math.round(40 / s), Math.round(150 / s));
  const getWordCount = () => getRandomInt(10, 150);
  const getWords = () => Math.max(1, Math.round(50 * s));

  const update = () => {
    if (stopped) return;

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

    if (!stopped) {
      timer = setTimeout(update, getInterval());
    }
  };

  onMounted(() => {
    if (!stopped) {
      timer = setTimeout(update, getInterval());
    }
  });

  onUnmounted(() => {
    stopped = true;
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  });

  return messages;
}
