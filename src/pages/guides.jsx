import React, { useState, useEffect, useRef } from "react";
import LayoutBackdrop from "../components/LayoutBackdrop";
import styles from "./guides.module.css";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import IconButton from "@mui/material/IconButton";
import DemoImage from "./Brand.png";
import Navbar from "@theme/Navbar";

const guides = () => {
  const [guideItems, setGuideItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [uniqueTags, setUniqueTags] = useState([]);

  const filteredItems = [
    {
      img: DemoImage,
      title: "How to show tables in Postgres",
      tag: ["postgres", "pgmq", "Desktop"],
      date: "Nov 12, 2023",
    },
    {
      img: DemoImage,
      title: "How to get  started with PGMQ",
      tag: ["pgmq"],
      date: "Aug 8, 2019",
    },
    {
      img: DemoImage,
      title: "How to Configure Docker Desktop for Windows",
      tag: ["Docker"],
      date: "Sept 15, 2020",
    },
    {
      img: DemoImage,
      title: "How to connect to PostgreSQL database using psql",
      tag: ["psql"],
      date: "Dec 25, 2022",
    },
  ];
  useEffect(() => {
    // Extract and spread tag elements into the uniqueTags array
    const tagArray = filteredItems.flatMap((item) => item.tag);
    const uniqueTags = Array.from(new Set(tagArray));
    setUniqueTags(["All guides", ...uniqueTags]);
    setGuideItems(filteredItems);
  }, []);
  const specificDivRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        specificDivRef.current &&
        !specificDivRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener("click", handleOutsideClick);

    return () => {
      window.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const handleSearch = (e) => {
    let searchTerm = e.target.value;
    setGuideItems(
      filteredItems.filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (item) => {
    if (item == "All guides") {
      setSelectedItem("Select tag");
      setGuideItems(filteredItems);
      setIsOpen(false);
    } else {
      setSelectedItem(item);
      let selectedTag = item;
      setGuideItems(
        filteredItems.filter((item) => item.tag.includes(selectedTag))
      );
      setIsOpen(false);
    }
  };

  const GuideCard = ({ img, title, tag, date }) => {
    return (
      <div className={styles.guidecard__container}>
        <a href="/guides/how-to-show-tables-in-postgres">
          <div className={styles.guidecard__image}>
            <img src={img} alt={title} />
          </div>
          <div className={styles.guidecard__content}>
            <div className={styles.guidecard__content__title}>{title}</div>
            <div className={styles.guidecard__content__details}>
              {tag.map((item, index) => (
                <div className={styles.guidecard__content__tag}>
                  {/* <span className={styles.span__tag__1}># </span> */}
                  <span className={styles.span__tag__2}>{item}</span>
                </div>
              ))}
              <div className={styles.guidecard__content__date}>{date}</div>
            </div>
          </div>
        </a>
      </div>
    );
  };
  return (
    // <div>
    <LayoutBackdrop>
      <h1>Guides</h1>
      <div className={styles.horizontal__filters}>
        <div className={styles.dropdown}>
          <button
            className={styles.dropbtn}
            onClick={toggleDropdown}
            ref={specificDivRef}
          >
            {selectedItem || "Select tag"}
            <IconButton size="small">
              <KeyboardArrowDownIcon fontSize="inherit" />
            </IconButton>
          </button>
          {isOpen && (
            <div className={styles.dropdown__content}>
              {uniqueTags.map((item, index) => (
                <div
                  key={index}
                  className={styles.dropdown__item}
                  onClick={() => handleItemClick(item)}
                >
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={styles.search__input__div}>
          <input
            type="text"
            placeholder="Search for guides"
            onChange={handleSearch}
            className={styles.search__input}
          />
        </div>
      </div>
      <div className={styles.guideslayout__container}>
        {guideItems.map((item) => (
          <div className={styles.gridlayout__item}>
            <GuideCard
              key={item.title}
              img={item.img}
              title={item.title}
              tag={item.tag}
              date={item.date}
            />
          </div>
        ))}
      </div>
    </LayoutBackdrop>
    // </div>
  );
};

export default guides;
