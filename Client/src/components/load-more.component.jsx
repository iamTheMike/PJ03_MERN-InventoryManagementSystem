

const LoadMoreDataBtn = ({state,fetchDataFun}) => {
    if(state && state.totalDocs > state.results.length){
        return (
            <button
            className="text-dark-grey p-2 px-3 hover:bg-grey rounded-md flex items-center gap-2"
            onClick={()=>fetchDataFun({page:state.page+1})}
            >
                Load More
            </button>
        )
    }
 
}

export default LoadMoreDataBtn