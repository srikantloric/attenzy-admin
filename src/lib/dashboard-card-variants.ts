import { cva } from "class-variance-authority"

export const cardVariants = cva(
  "flex flex-col relative border rounded-lg p-4 min-h-[140px] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-linear-to-tl from-secondary to-[#00292B]/80 text-secondary-foreground border-transparent",
        light:
          "bg-white text-gray-900 border-gray-200 dark:bg-secondary dark:text-white dark:border-gray-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export const iconVariants = cva("rounded-md p-1.5", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground",
      light: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-100",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export const badgeVariants = cva("", {
  variants: {
    variant: {
      default: "bg-primary/20 text-primary",
      light: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-100",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})
