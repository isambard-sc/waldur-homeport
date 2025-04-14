import { throttle } from 'lodash-es';
import { useCallback, useEffect, useState } from 'react';

interface useScrollTrackerProps {
  sectionIds: string[];
  /** @param trackSide determines where to track the element. Bottom of the page or top of the page */
  trackSide?: 'top' | 'bottom' | 'area';
  offset?: number; // in px
}

const useScrollTracker = (props: useScrollTrackerProps) => {
  const [activeSection, setActiveSection] = useState(null);

  const handleScroll = useCallback(
    throttle(() => {
      const sections = props.sectionIds
        .map((id) => document.getElementById(id))
        .filter(Boolean);

      const scrollBottom = window.scrollY + window.innerHeight;
      const scrollTop = window.scrollY;
      const thresholdBottom = scrollBottom - props.offset;
      const thresholdTop = scrollTop + props.offset;
      let newActiveSection = null;
      let maxOverlapPercentage = 0;

      sections.forEach((section, index) => {
        const sectionOffsetTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionOffsetBottom = sectionOffsetTop + sectionHeight;

        const isLastIndex = index === sections?.length - 1;

        if (props.trackSide === 'area') {
          // To determine which section is active, we calculate the largest area covered by the sections as a percentage.
          const overlapTop = Math.max(thresholdTop, sectionOffsetTop);
          const overlapBottom = Math.min(thresholdBottom, sectionOffsetBottom);
          const overlap = Math.max(0, overlapBottom - overlapTop);
          const overlapPercentage = (overlap / sectionHeight) * 100;

          if (overlapPercentage > maxOverlapPercentage) {
            maxOverlapPercentage = overlapPercentage;
            newActiveSection = section.id;
          }
          // A little more attention for the last section
          if (isLastIndex && overlapPercentage > 90) {
            newActiveSection = section.id;
          }
        } else {
          const thresholdPoint =
            props.trackSide === 'top' ? thresholdTop : thresholdBottom;
          if (
            thresholdPoint >= sectionOffsetTop &&
            window.scrollY < sectionOffsetTop + sectionHeight
          ) {
            newActiveSection = section.id;
          }
          // If we are in the upper position of the first section
          else if (index === 0 && thresholdPoint < sectionOffsetTop) {
            newActiveSection = section.id;
          }
          // If we are in the bottom position of the last section
          else if (isLastIndex && thresholdPoint > sectionOffsetTop) {
            newActiveSection = section.id;
          }
        }
      });

      setActiveSection(newActiveSection);
    }, 100),
    [props.trackSide, props.offset, props.sectionIds, setActiveSection],
  );

  useEffect(() => {
    handleScroll();
  }, [props.sectionIds]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    document.addEventListener('click', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      document.removeEventListener('click', handleScroll);
    };
  }, [handleScroll]);

  return activeSection;
};

export default useScrollTracker;
