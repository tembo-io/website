import React, { useState, useEffect, useRef } from "react";
import LayoutBackdrop from "../components/LayoutBackdrop";
import styles from "./guides.module.css";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const guides = () => {
  const [guideItems, setGuideItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredItems = [
    {
      img: "https://images.unsplash.com/photo-1575936123452-b67c3203c357?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
      title: "Lorem Ipsum is simply dummy text",
      tag: "tag1",
      date: "Nov 12, 2023",
    },
    {
      img: "https://images.unsplash.com/photo-1575936123452-b67c3203c357?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
      title: "Lorem Ipsum is simply dummy text",
      tag: "tag2",
      date: "Aug 8, 2019",
    },
    {
      img: "https://images.unsplash.com/photo-1575936123452-b67c3203c357?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
      title: "Lorem Ipsum is simply dummy text",
      tag: "tag1",
      date: "Sept 15, 2020",
    },
    {
      img: "https://images.unsplash.com/photo-1575936123452-b67c3203c357?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
      title: "Lorem Ipsum is simply dummy text",
      tag: "tag3",
      date: "Dec 25, 2022",
    },
    {
      img: "https://images.unsplash.com/photo-1575936123452-b67c3203c357?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
      title: "Lorem Ipsum is simply dummy text",
      tag: "tag3",
      date: "Dec 20, 2022",
    },
    {
      img: "https://images.unsplash.com/photo-1575936123452-b67c3203c357?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
      title: "Lorem Ipsum is simply dummy text",
      tag: "tag3",
      date: "Feb 14, 2023",
    },
  ];
  const tagsArray = filteredItems.map((item) => item.tag);
  useEffect(() => setGuideItems(filteredItems), []);

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

  const handleTagChange = (e) => {
    let selectedTag = e.target.value;
    setGuideItems(filteredItems.filter((item) => item.tag == selectedTag));
  };

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
    setSelectedItem(item);
    let selectedTag = item;
    setGuideItems(filteredItems.filter((item) => item.tag == selectedTag));
    setIsOpen(false);
  };

  const GuideCard = ({ img, title, tag, date }) => {
    return (
      <div className={styles.guidecard__container}>
        <div className={styles.guidecard__image}>
          <img src={img} alt={title} />
        </div>
        <div className={styles.guidecard__content}>
          <div className={styles.guidecard__content__title}>{title}</div>
          <div className={styles.guidecard__content__details}>
            <div className={styles.guidecard__content__tag}>
              <span className={styles.span__tag__1}># </span>
              <span className={styles.span__tag__2}>{tag}</span>
            </div>
            <div className={styles.guidecard__content__date}>{date}</div>
          </div>
        </div>
      </div>
    );
  };
  return (
    <div>
      {/* <LayoutBackdrop />  */}
      <h1>Guides</h1>
      <div className={styles.horizontal__filters}>
        <div className={styles.dropdown}>
          <button
            className={styles.dropbtn}
            onClick={toggleDropdown}
            ref={specificDivRef}
          >
            {selectedItem || "Select tag"} <KeyboardArrowDownIcon />
          </button>
          {isOpen && (
            <div className={styles.dropdown__content}>
              {Array.from(new Set(tagsArray)).map((item, index) => (
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
    </div>
  );
};

export default guides;
