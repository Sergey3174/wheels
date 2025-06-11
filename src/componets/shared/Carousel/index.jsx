import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import axios from "axios";

import { Button } from "../../controls/Button";
import { Item } from "./parts/Item";
import { WinModal } from "../../modals/WinModal";

import "./index.scss";

export const Carousel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [winPrize, setWinPrize] = useState(null);

  const isSmall = useRef(false);
  const cardWidth = useRef(null);
  const currentActiveIndex = useRef(1);
  const itemsBox = useRef(null);
  const repeatCount = useRef(3);
  const gap = useRef(8);
  const totalWidth = useRef(0);

  // Получить предметы для рулетки
  const getItems = async () => {
    try {
      const { data } = await axios.get("https://app.gamesport.com/api/wheel", {
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTA3fQ.TYPMgCe9UaYafGHtjELDOhF25FabF9Madx_NrHfzLvo`,
          "Content-Type": "application/json",
        },
      });

      if (data.data.wheel_prizes.length) {
        setItems([...data.data.wheel_prizes]);
        setIsLoading(true);
      } else {
        alert("Извините, но вы не можете крутить колесо");
      }
    } catch (error) {
      console.error("Ошибка при получении карточек:", error);
    }
  };
  // Получить выигрышныйId
  const getWinCardInfo = async () => {
    try {
      const { data } = await axios.post(
        "https://app.gamesport.com/api/wheel",
        {},
        {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTA3fQ.TYPMgCe9UaYafGHtjELDOhF25FabF9Madx_NrHfzLvo`,
            "Content-Type": "application/json",
          },
        }
      );
      if (data.data.prize_id) {
        return data.data.prize_id;
      } else {
        console.error(data.data.message);
        return null;
      }
    } catch (error) {
      console.error("Ошибка при получении выигрышной карточки:", error);
    }
  };
  // Получить рандомное смещение для маленьких и больших экранов
  const getRandomShiftOffset = () => {
    if (isSmall.current) {
      return Math.floor(Math.random() * 86) - 60;
    } else {
      return Math.floor(Math.random() * 126) - 115;
    }
  };

  const createAnimation = (shift, winCard, prizeId) => {
    // Импорт аудио
    const startScrollSound = new Audio("/sounds/open-case.wav");
    const scrollSound = new Audio("/sounds/case-spin.mp3");
    const scrollEndSound = new Audio("/sounds/take-drop.wav");
    startScrollSound.volume = 0.3;
    scrollSound.volume = 0.3;
    scrollEndSound.volume = 0.4;

    const randomOffset = getRandomShiftOffset();

    // Дополнительный отступ для различных экранов и отступов(чтобы нормально работала смена активного элемента)
    const additionalOffset = isSmall.current
      ? randomOffset > -20
        ? 30
        : 20
      : randomOffset > 0
      ? 0
      : 15;
    // Анимация прокрутки с рандомным смещением
    return gsap
      .timeline()
      .to(itemsBox.current, {
        x: 0,
        duration: 0,
        ease: "none",
      })
      .to(itemsBox.current, {
        x: `-=${shift + randomOffset}`,
        duration: 10,
        ease: "power4.out",
        // звук открытия крутилки
        onStart: function () {
          startScrollSound.currentTime = 0;
          startScrollSound.play().catch(() => {});
        },
        onUpdate: function () {
          const currentX = gsap.getProperty(itemsBox.current, "x");
          let centerIndex;
          // Динамически считает какой элемент в центре
          centerIndex = Math.round(
            Math.abs(currentX + additionalOffset + gap.current * prizeId - 2) /
              cardWidth.current
          );
          // Применяет стиль для центрального элемента
          if (centerIndex > 1 && currentActiveIndex.current !== centerIndex) {
            document
              .querySelector(`.cardsScroll-item-${centerIndex}`)
              .classList.add("activeScroll");
            document
              .querySelector(`.cardsScroll-item-${centerIndex - 1}`)
              .classList.remove("activeScroll");

          }
          // Для проигрыша звука
          if (currentActiveIndex.current !== centerIndex) {
            scrollSound.currentTime = 0;
            scrollSound.play().catch(() => {});
          }
          currentActiveIndex.current = centerIndex;
        },
        onComplete: () => {
          // проигрыш финального звука
          scrollEndSound.currentTime = 0;
          scrollEndSound.play().catch(() => {});
          const cards = document.querySelectorAll(".cardsScroll-item");
          // удаляем все возможные активные элементы
          cards.forEach((item) =>
            item.classList.remove("activeScroll", "active")
          );
          // выигрышной карте ставим active
          const winningCard = cards[winCard + 1];
          if (winningCard) {
            winningCard.classList.add("active");
            // Нужно для правильной анимации центровки активного элемента
            centerActiveElement();
          }
          // Открываем модалку и выключаем дизейбл у кнопки
          setIsScrolling(false);
          setIsOpenModal(true);
        },
      });
  };

  const centerActiveElement = () => {
    const activeCard = document.querySelector(".cardsScroll-item.active");

    const activeCardWidth = isSmall.current ? 183 : 213;
    const container = itemsBox.current;

    const cardRect = activeCard.getBoundingClientRect();
    const containerCenterX = window.innerWidth / 2;
    const cardCenterX = cardRect.left + activeCardWidth / 2;
    const offset = containerCenterX - cardCenterX;
    // Центрируем активный элемент
    gsap.to(container, {
      x: `+=${offset}`,
      duration: 0.5,
      ease: "power2.out",
    });
  };

  const startGame = () => {
    setIsScrolling(true);
    const getWinCard = async () => {
      const prizeId = await getWinCardInfo();
      if (!prizeId) {
        setIsScrolling(false);
        return;
      }
      setWinPrize(prizeId);
      // доп прокрутки
      const extraRounds = 2;

      // находим index выигрышной карты и считаем её позицию
      const winCard =
        prizeId -
        2 +
        (itemsBox.current.children.length / repeatCount.current) * extraRounds;

      const fullCardsWidthX = winCard * cardWidth.current;
      const gapFull = winCard * gap.current;
      const oneMiddleCard = cardWidth.current / 2;
      const positionX = fullCardsWidthX + gapFull + oneMiddleCard;
      // Удаляем active если есть
      document
        .querySelector(".cardsScroll-item.active")
        ?.classList.remove("active");
      // Создаём и запускаем анимацию
      const animation = createAnimation(positionX, winCard, prizeId);
      animation.play();
    };

    getWinCard();
  };
  useEffect(() => {
    const fetchData = async () => {
      await getItems();

      cardWidth.current = window.innerWidth >= 460 ? 170 : 145;
      isSmall.current = cardWidth.current === 170 ? false : true;

      requestAnimationFrame(() => {
        centerActiveElement();
      });

      if (itemsBox.current) {
        totalWidth.current = itemsBox.current.scrollWidth / repeatCount.current;
      }
    };

    fetchData();
  }, []);

  if (!isLoading) {
    return null;
  }

  return (
    <>
      <section className="carousel">
        {/* Не знаю как вы с свг работаете, поэтому оставил так */}
        <svg
          style={{
            position: "absolute",
            inset: "0",
            width: "100%",
          }}
          width="360"
          height="800"
          viewBox="0 0 360 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter="url(#filter0_f_2003_15939)">
            <path
              d="M180.5 -151L210.626 249.047L391.55 -109.02L266.291 272.104L570.469 10.5306L308.896 314.709L690.02 189.45L331.953 370.374L732 400.5L331.953 430.626L690.02 611.55L308.896 486.291L570.469 790.469L266.291 528.896L391.55 910.02L210.626 551.953L180.5 952L150.374 551.953L-30.5499 910.02L94.7089 528.896L-209.469 790.469L52.1045 486.291L-329.02 611.55L29.0471 430.626L-371 400.5L29.0471 370.374L-329.02 189.45L52.1045 314.709L-209.469 10.5306L94.7089 272.104L-30.5499 -109.02L150.374 249.047L180.5 -151Z"
              fill="white"
              fillOpacity="0.09"
            />
          </g>
          <defs>
            <filter
              id="filter0_f_2003_15939"
              x="-395"
              y="-175"
              width="1151"
              height="1151"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feGaussianBlur
                stdDeviation="12"
                result="effect1_foregroundBlur_2003_15939"
              />
            </filter>
          </defs>
        </svg>
        {/* Не знаю как вы с свг работаете, поэтому оставил так */}

        <div className="carousel__box">
          <div className="carousel__info">
            <div className="cardsScroll" ref={itemsBox}>
              {[]
                .concat(...Array(repeatCount.current).fill(items))
                .map((item, index) => (
                  <Item
                    key={index}
                    index={index}
                    count={item.tickets}
                    isActive={index === 1 ? "active" : ""}
                  />
                ))}
            </div>

            <div className="cardsScroll__mark">
              <img src="/icons/marks/mark.svg" alt="иконка треугольника" />
            </div>
          </div>

          <div className="carousel__footer">
            <Button type={"button"} disabled={isScrolling} onClick={startGame}>
              <span>Крутить</span>

              <div className="button-price">
                <span>5</span>

                <span className="icon">
                  <img
                    src="/icons/tickets/ticketNoShadow.svg"
                    alt="иконка билета"
                  />
                </span>
              </div>
            </Button>
          </div>
        </div>
      </section>

      {winPrize && (
        <WinModal
          tickets={items[winPrize - 1].tickets}
          isOpenModal={isOpenModal}
          onClose={() => setIsOpenModal(false)}
        />
      )}
    </>
  );
};
