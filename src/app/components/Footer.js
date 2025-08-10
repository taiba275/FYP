import React from 'react';

function Footer() {
  return (
    <div>
      <footer className="bg-white text-gray-800 font-sans text-sm px-10 py-5">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-10">
            <div className="text-2xl font-bold text-gray-900 mb-1 md:mb-0">JobFinder.</div>
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto flex justify-between items-center border-t border-gray-300 mt-3 pt-3">
          <div className="text-gray-600">
            Cookies Policy | Legal Terms | Privacy Policy
          </div>
          <div className="flex items-center space-x-4">
            <a href="https://www.instagram.com/finder7838/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">Instagram</a>
            <a href="https://www.linkedin.com/in/job-finder-071a17379/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">LinkedIn</a>
            <a href="https://x.com/JobFinder110907" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">Twitter</a>
            <a href="https://www.facebook.com/profile.php?id=61578826785190" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">Facebook</a>
          </div>
          <div className="text-gray-600">
            Sponsored by Us
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Footer;
