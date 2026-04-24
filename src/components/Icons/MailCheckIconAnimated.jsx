import { motion, useAnimation } from "framer-motion";
import { forwardRef, useCallback, useImperativeHandle, useRef, useEffect } from "react";

const CHECK_VARIANTS = {
  normal: {
    pathLength: 1,
    opacity: 1,
  },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
};

const MailCheckIcon = forwardRef(function MailCheckIcon(
  { onMouseEnter, onMouseLeave, className, size = 28, autoPlay = true, ...props },
  ref
) {
  const controls = useAnimation();
  const isControlledRef = useRef(false);

  useImperativeHandle(ref, () => {
    isControlledRef.current = true;

    return {
      startAnimation: () => controls.start("animate"),
      stopAnimation: () => controls.start("normal"),
    };
  });

  useEffect(() => {
    if (autoPlay) {
      controls.start("animate");
    }
  }, [controls, autoPlay]);

  const handleMouseEnter = useCallback(
    (e) => {
      if (isControlledRef.current) {
        onMouseEnter && onMouseEnter(e);
      } else {
        controls.start("animate");
      }
    },
    [controls, onMouseEnter]
  );

  const handleMouseLeave = useCallback(
    (e) => {
      if (isControlledRef.current) {
        onMouseLeave && onMouseLeave(e);
      } else {
        controls.start("normal");
      }
    },
    [controls, onMouseLeave]
  );

  return (
    <div
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <svg
        fill="none"
        height={size}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width={size}
      >
        <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />

        <motion.path
          d="m16 19 2 2 4-4"
          animate={controls}
          initial="normal"
          variants={CHECK_VARIANTS}
        />
      </svg>
    </div>
  );
});

export { MailCheckIcon };