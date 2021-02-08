-- phpMyAdmin SQL Dump
-- version 5.0.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 08, 2021 at 11:44 PM
-- Server version: 10.4.17-MariaDB
-- PHP Version: 7.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dal_assignment`
--

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `prod_id` int(11) NOT NULL,
  `order_date` date NOT NULL,
  `order_amount` double(10,2) NOT NULL,
  `order_qty` int(5) NOT NULL,
  `createdAt` date NOT NULL,
  `updatedAt` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `prod_id`, `order_date`, `order_amount`, `order_qty`, `createdAt`, `updatedAt`) VALUES
(1, 1, '2021-02-07', 1254.00, 5, '2021-02-06', '2021-02-06'),
(3, 3, '2021-01-26', 1455.00, 7, '2021-02-06', '2021-02-06'),
(4, 3, '2020-11-25', 1455.00, 7, '2021-02-06', '2021-02-06'),
(6, 2, '2020-12-03', 1310.00, 5, '2021-02-06', '2021-02-06'),
(7, 2, '2020-02-05', 1310.00, 8, '2020-12-06', '2021-02-06'),
(8, 1, '2021-02-05', 1310.00, 3, '2021-02-06', '2021-02-06');

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE `product` (
  `id` int(11) NOT NULL,
  `prod_name` varchar(200) NOT NULL,
  `prod_price` double(10,2) NOT NULL,
  `prod_exp_date` date NOT NULL,
  `createdAt` date NOT NULL,
  `updatedAt` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`id`, `prod_name`, `prod_price`, `prod_exp_date`, `createdAt`, `updatedAt`) VALUES
(1, 'OMNiX P1 Plus Sports Band', 3499.00, '2021-02-06', '2021-02-06', '2021-02-06'),
(2, 'Opta SB-001 Bluetooth Fast tracker', 2249.00, '2021-02-10', '2021-02-06', '2021-02-06'),
(3, 'Mi Band - HRX Edition', 1299.00, '2019-09-10', '2021-02-06', '2021-02-06'),
(4, 'Fastrack Reflex Smartwatch', 1495.00, '2021-05-05', '2021-02-06', '2021-02-06');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `password` varchar(250) CHARACTER SET utf16 COLLATE utf16_bin NOT NULL,
  `salt` varchar(200) NOT NULL,
  `email` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `address` varchar(100) NOT NULL,
  `city` varchar(50) NOT NULL,
  `profile_pic` text NOT NULL,
  `createdAt` date NOT NULL,
  `updatedAt` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `first_name`, `last_name`, `password`, `salt`, `email`, `username`, `address`, `city`, `profile_pic`, `createdAt`, `updatedAt`) VALUES
(24, 'Abhishek', 'Das', 'e96751bd603c6c92365079f27eb04d954e6287a8c84c01fb2eaa68484467db18cdbef28b855f342f728d1b40159ba56a0f1f36775601186eb1b36c37f0e1803f', '5dc5ae2fb72cbc376c6d0c755ca0f354', 'admin@digitalavenue.com', '', '', '', '', '2021-02-05', '2021-02-05');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `product`
--
ALTER TABLE `product`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
