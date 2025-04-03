import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Component for displaying a list of study guides within a category
 */
const StudyGuideList = ({ studyGuides, sectionId, categoryId, selectedGuideId, isLoading }) => {

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow h-full flex flex-col">
        <h3 className="text-xl font-bold mb-4 text-slate-900">Study Guides</h3>
        <div className="flex justify-center items-center p-4 text-slate-500">
          <div className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-teal-700 animate-spin mr-3"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow h-full flex flex-col">
      <h3 className="text-xl font-bold mb-4 text-slate-900">Study Guides</h3>

      {studyGuides && studyGuides.length > 0 ? (
        <ul className="list-none p-0 m-0">
          {studyGuides.map(guide => (
            <li
              key={guide.id}
              className={`p-3 border-b border-slate-200 rounded transition-colors ${guide.id === selectedGuideId ? 'bg-teal-50' : 'bg-transparent'}`}
            >
              <Link
                to={`/study/${sectionId}/${categoryId}/${guide.id}`}
                className="text-teal-700 no-underline block w-full"
              >
                {guide.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center p-4 text-slate-500">
          <p>No study guides available</p>
        </div>
      )}
    </div>
  );
};

export default StudyGuideList;
