import React from 'react';

function Footer() {
  return (
    <div>
      <footer className="bg-white text-gray-800 font-sans text-sm px-10 py-5 mt-10 border-t border-gray-300">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-10">
            <div>Job Finder</div>
            <div className="flex space-x-10">
              <div className="flex flex-col space-y-3 ">
                <a href="/trends" className="text-base hover:text-gray-600">Trends</a>
                <a href="/industry" className="text-base hover:text-gray-600">Industry</a>
              </div>
              <div className="flex flex-col space-y-3 ">
                <a href="#" className="text-base hover:text-gray-600">Directory</a>
                <a href="#" className="text-base hover:text-gray-600">Conferences</a>
              </div>
              <div className="flex flex-col space-y-3 ">
                <a href="#" className="text-base hover:text-gray-600">About Us</a>
                <a href="#" className="text-base hover:text-gray-600">Contact Us</a>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <a href="#" className="bg-gray-100 hover:bg-gray-200 text-sm px-4 py-2 rounded-md"></a>
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto flex justify-between items-center border-t border-gray-300 mt-3 pt-3">
          <div className="text-gray-600">
            Cookies Policy | Legal Terms | Privacy Policy
          </div>
          <div className="flex items-center space-x-4">
            <a href="#" className="hover:text-gray-600">Instagram</a>
            <a href="#" className="hover:text-gray-600">LinkedIn</a>
            <a href="#" className="hover:text-gray-600">Twitter</a>
            <a href="#" className="hover:text-gray-600">Facebook</a>
            <a href="#" className="hover:text-gray-600">YouTube</a>
            <a href="#" className="hover:text-gray-600">TikTok</a>
            <a href="#" className="hover:text-gray-600">Pinterest</a>
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
