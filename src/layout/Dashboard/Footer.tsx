

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="flex justify-end">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-4 text-sm text-muted-foreground md:flex-row">
        <p>
          © {year} <span className="font-medium text-foreground">Loric Software</span>. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer