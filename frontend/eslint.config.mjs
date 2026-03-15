import nextConfig from "eslint-config-next";

const eslintConfig = [
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
  ...nextConfig.configs["core-web-vitals"],
  ...nextConfig.configs["typescript"],
];

export default eslintConfig;
