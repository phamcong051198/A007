import React from 'react'

const Actions = ({
  addAccountPair,
  removeAccountPair,
  addAllAccountPair,
  removeAllAccountPair,
  addSelectionAccountPair,
  handleClearInvalidAccount
}) => {
  return (
    <div className="flex flex-col gap-1 py-5 pl-6">
      <button
        className="outline-none border border-zinc-400 w-44 font-bold text-[#0000FF] rounded p-[1px] bg-white hover:border-blue-400"
        onClick={addAccountPair}
      >
        Add {'>'}
      </button>
      <button
        className=" outline-none border border-zinc-400 w-44 font-bold text-[#FF0000] rounded p-[1px] bg-white hover:border-blue-400"
        onClick={removeAccountPair}
      >
        {'<'} Remove
      </button>

      <button
        className="outline-none border border-zinc-400 w-44 font-bold text-[#0000FF] rounded p-[1px] bg-white hover:border-blue-400"
        onClick={addAllAccountPair}
      >
        Add All {'>>'}
      </button>
      <button
        className="outline-none border border-zinc-400 w-44 font-bold text-[#FF0000] rounded p-[1px] bg-white hover:border-blue-400"
        onClick={removeAllAccountPair}
      >
        {'<<'} Remove All
      </button>
      <button
        className="outline-none border border-zinc-400 w-44 font-bold text-[#0000FF] rounded p-[1px] bg-white hover:border-blue-400"
        onClick={addSelectionAccountPair}
      >
        Add Selection {'>>>'}
      </button>

      <button className="outline-none border border-zinc-400 w-44 font-bold text-black  rounded p-[1px] bg-white  hover:border-blue-400   flex justify-center ">
        <div className="bg-[#fab8b8] m-[1px] w-full" onClick={handleClearInvalidAccount}>
          Clear Invalid Account
        </div>
      </button>
    </div>
  )
}

export default React.memo(Actions)
