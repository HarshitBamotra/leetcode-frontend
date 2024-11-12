// import CollapsableTopicProblem from "./CollapsableTopicProblems";
// import SampleProblemList from "../../constants/SampleProblemList";
// import { ProblemData } from "../../types/problem.types";

// type Topic = {
//     topic: string;
//     topicId: string;
//     problems: ProblemData[];
// }

// function ProblemList() {

//     return (
//         <div className="flex justify-center items-center w-[100vw]">

//             <div className="topic-list flex flex-col w-[60%]">
                    
//                    {/* {SampleProblemList.map((topic: Topic) => <CollapsableTopicProblem topicName={topic.topic} key={topic.topicId} problems={topic.problems}/>)} */}
//             </div>


//         </div>
//     )
// }

// export default ProblemList;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';

interface Problem {
  _id: string;
  title: string;
  difficulty: string;
}

function ProblemList() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/v1/problems/');
        setProblems(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching problems:', error);
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-900 text-green-200';
      case 'medium':
        return 'bg-yellow-900 text-yellow-200';
      case 'hard':
        return 'bg-red-900 text-red-200';
      default:
        return 'bg-gray-800 text-gray-200';
    }
  };

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || problem.difficulty.toLowerCase() === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-200 mb-4">Problem List</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Bar */}
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search problems..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200 
                       placeholder-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Difficulty Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200 
                       appearance-none"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Problem List */}
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-700 bg-gray-900 font-semibold text-gray-300">
          <div className="col-span-1">#</div>
          <div className="col-span-8">Title</div>
          <div className="col-span-3">Difficulty</div>
        </div>
        
        <div className="divide-y divide-gray-700">
          {filteredProblems.map((problem, index) => (
            <div
              key={problem._id}
              className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-700 cursor-pointer 
                       transition-colors duration-150"
              onClick={() => navigate(`/problem/${problem._id}`)}
            >
              <div className="col-span-1 text-gray-400">{index + 1}</div>
              <div className="col-span-8 font-medium text-gray-200 hover:text-blue-400">
                {problem.title}
              </div>
              <div className="col-span-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(problem.difficulty)}`}>
                  {problem.difficulty}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredProblems.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">
            No problems found matching your criteria
          </div>
        </div>
      )}
    </div>
  );
}

export default ProblemList;